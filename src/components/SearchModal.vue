<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import MiniSearch from 'minisearch';

/**
 * ⌘K command-palette search.
 *
 * Hydrated with `client:idle` and the index is fetched on FIRST OPEN, not on
 * hydrate — so a visitor who never searches ships no Vue execution and
 * downloads zero index bytes. That ordering is why a full-text index is
 * affordable here at all (390 KB raw / 116 KB gzipped for 49 posts).
 *
 * Keyboard model is the ARIA combobox/listbox pattern: focus never leaves the
 * input, the highlighted row is published via aria-activedescendant, and the
 * result anchors carry tabindex="-1" so Tab doesn't walk 20 links. Mouse
 * behaviour stays native — cmd/middle-click open a new tab as usual.
 */

interface IndexEntry {
  id: string;
  url: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  categories: string[];
  text: string;
}

interface Hit {
  id: string;
  url: string;
  title: string;
  date: string;
  tags: string[];
  snippet: Segment[];
}

interface Segment {
  text: string;
  hit: boolean;
}

/** Rows shown for an empty query, so the palette is useful before typing. */
const RECENT_COUNT = 6;
const MAX_RESULTS = 20;

const open = ref(false);
const query = ref('');
const loading = ref(false);
const failed = ref(false);
const loaded = ref(false);
const entries = ref<IndexEntry[]>([]);
const active = ref(0);

const inputEl = ref<HTMLInputElement | null>(null);
const closeEl = ref<HTMLButtonElement | null>(null);

// Deliberately non-reactive: MiniSearch holds its own inverted index, and
// wrapping it in a Vue proxy on every keystroke would be pure overhead.
let mini: MiniSearch<IndexEntry> | null = null;
let lastFocused: HTMLElement | null = null;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Query split into highlightable terms. 1-char terms match everything, so drop them. */
const terms = computed(() =>
  [...new Set(query.value.toLowerCase().split(/\s+/).filter((t) => t.length >= 2))],
);

function highlight(text: string, needles: string[]): Segment[] {
  if (!text || !needles.length) return text ? [{ text, hit: false }] : [];
  const re = new RegExp(`(${needles.map(escapeRegExp).join('|')})`, 'gi');
  const lower = needles.map((n) => n.toLowerCase());
  return text
    .split(re)
    .filter((s) => s !== '')
    .map((s) => ({ text: s, hit: lower.includes(s.toLowerCase()) }));
}

/**
 * A window of body text around the first match, so a result shows *why* it
 * matched. Falls back to the head of the post when the hit was title/tag-only.
 */
function excerpt(text: string, needles: string[], radius = 110): Segment[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  let at = -1;
  for (const n of needles) {
    const i = lower.indexOf(n);
    if (i !== -1 && (at === -1 || i < at)) at = i;
  }
  if (at === -1) return highlight(text.slice(0, radius * 2), needles);

  // Snap the window outward to word boundaries — slicing on a raw character
  // offset produces excerpts that start mid-word ("…ustom static site").
  let start = Math.max(0, at - radius);
  let end = Math.min(text.length, at + radius);
  if (start > 0) {
    const space = text.indexOf(' ', start);
    if (space !== -1 && space < at) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(' ', end);
    if (space !== -1 && space > at) end = space;
  }

  return [
    ...(start > 0 ? [{ text: '… ', hit: false }] : []),
    ...highlight(text.slice(start, end), needles),
    ...(end < text.length ? [{ text: ' …', hit: false }] : []),
  ];
}

function toHit(entry: IndexEntry, needles: string[]): Hit {
  return {
    id: entry.id,
    url: entry.url,
    title: entry.title,
    date: entry.date,
    tags: entry.tags,
    snippet: excerpt(entry.text, needles),
  };
}

const results = computed<Hit[]>(() => {
  const q = query.value.trim();
  const needles = terms.value;

  if (!q) {
    return entries.value.slice(0, RECENT_COUNT).map((e) => toHit(e, []));
  }
  if (!mini) return [];

  return mini
    .search(q)
    .slice(0, MAX_RESULTS)
    .map((r) => {
      const entry = entries.value.find((e) => e.id === r.id);
      return entry ? toHit(entry, needles) : null;
    })
    .filter((h): h is Hit => h !== null);
});

const isRecent = computed(() => query.value.trim() === '');

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

async function ensureIndex(): Promise<void> {
  if (loaded.value || loading.value || mini) return;
  loading.value = true;
  failed.value = false;

  try {
    const res = await fetch('/search.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as IndexEntry[];

    mini = new MiniSearch<IndexEntry>({
      idField: 'id',
      fields: ['title', 'description', 'tags', 'categories', 'text'],
      storeFields: ['url', 'title', 'date', 'tags', 'description', 'text'],
      searchOptions: {
        // Title and tags outweigh body prose — a title match is almost always
        // the intent, and without a boost a long post can outrank a page whose
        // name is literally the query.
        boost: { title: 8, tags: 4, categories: 3, description: 3 },
        prefix: true,
        fuzzy: 0.2,
      },
    });
    mini.addAll(data);

    entries.value = data;
    loaded.value = true;
  } catch {
    failed.value = true;
  } finally {
    loading.value = false;
  }
}

let scrollbarPad = '';

function openModal(): void {
  if (open.value) return;
  lastFocused = document.activeElement as HTMLElement | null;
  open.value = true;

  // Lock the page behind the palette, compensating for the vanished scrollbar
  // so the layout doesn't jump sideways on open.
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  scrollbarPad = document.body.style.paddingRight;
  document.body.style.overflow = 'hidden';
  if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;

  void ensureIndex();
  void nextTick(() => inputEl.value?.focus());
}

function closeModal(): void {
  if (!open.value) return;
  open.value = false;
  document.body.style.overflow = '';
  document.body.style.paddingRight = scrollbarPad;
  query.value = '';
  active.value = 0;
  lastFocused?.focus();
}

function go(index: number): void {
  const hit = results.value[index];
  if (hit) window.location.assign(hit.url);
}

function move(delta: number): void {
  const count = results.value.length;
  if (!count) return;
  active.value = (active.value + delta + count) % count;
  void nextTick(() => {
    document
      .getElementById(`search-opt-${active.value}`)
      ?.scrollIntoView({ block: 'nearest' });
  });
}

function onInputKeydown(event: KeyboardEvent): void {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      move(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      move(-1);
      break;
    case 'Home':
      event.preventDefault();
      active.value = 0;
      break;
    case 'End':
      event.preventDefault();
      active.value = Math.max(0, results.value.length - 1);
      break;
    case 'Enter':
      event.preventDefault();
      go(active.value);
      break;
    case 'Tab': {
      // Keep focus inside the dialog: only the input and the close button are
      // tabbable, so the cycle is always two stops.
      const stops = [inputEl.value, closeEl.value].filter(Boolean) as HTMLElement[];
      if (stops.length < 2) return;
      event.preventDefault();
      const at = stops.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? (at - 1 + stops.length) % stops.length
        : (at + 1) % stops.length;
      stops[next]?.focus();
      break;
    }
  }
}

function onDocumentKeydown(event: KeyboardEvent): void {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    open.value ? closeModal() : openModal();
    return;
  }
  if (event.key === 'Escape' && open.value) {
    event.preventDefault();
    closeModal();
  }
}

function onDocumentClick(event: MouseEvent): void {
  const trigger = (event.target as HTMLElement | null)?.closest('[data-search-open]');
  if (!trigger) return;
  event.preventDefault();
  openModal();
}

// A new query re-ranks everything, so the old highlight index is meaningless.
watch(query, () => {
  active.value = 0;
});

onMounted(() => {
  document.addEventListener('keydown', onDocumentKeydown);
  document.addEventListener('click', onDocumentClick);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onDocumentKeydown);
  document.removeEventListener('click', onDocumentClick);
  if (open.value) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = scrollbarPad;
  }
});
</script>

<template>
  <div v-if="open" class="scrim" @click.self="closeModal">
    <div
      class="panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-label"
      @keydown="onInputKeydown"
    >
      <h2 id="search-label" class="sr-only">Search posts</h2>

      <div class="field">
        <span class="prompt" aria-hidden="true">&gt;</span>
        <input
          ref="inputEl"
          v-model="query"
          type="text"
          class="input"
          placeholder="Search posts…"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          :aria-activedescendant="results.length ? `search-opt-${active}` : undefined"
          aria-autocomplete="list"
        />
        <button
          ref="closeEl"
          type="button"
          class="close"
          aria-label="Close search"
          @click="closeModal"
        >
          ESC
        </button>
      </div>

      <p class="sr-only" aria-live="polite">
        {{
          loading
            ? 'Loading search index'
            : `${results.length} ${results.length === 1 ? 'result' : 'results'} available`
        }}
      </p>

      <div class="body">
        <p v-if="loading" class="state">Loading index…</p>
        <p v-else-if="failed" class="state">
          Search index unavailable. Browse <a href="/posts/">all posts</a> instead.
        </p>

        <template v-else>
          <p v-if="isRecent && results.length" class="group">Recent posts</p>

          <ul v-if="results.length" id="search-results" class="results" role="listbox">
            <li
              v-for="(hit, i) in results"
              :key="hit.id"
              :id="`search-opt-${i}`"
              class="result"
              role="option"
              :aria-selected="i === active"
              :class="{ active: i === active }"
              @mouseenter="active = i"
            >
              <a :href="hit.url" tabindex="-1" @click="closeModal">
                <span class="head">
                  <span class="title">
                    <template v-for="(seg, si) in highlight(hit.title, terms)" :key="si">
                      <mark v-if="seg.hit">{{ seg.text }}</mark>
                      <template v-else>{{ seg.text }}</template>
                    </template>
                  </span>
                  <time class="date" :datetime="hit.date">{{ formatDate(hit.date) }}</time>
                </span>
                <span v-if="hit.snippet.length" class="snip">
                  <template v-for="(seg, si) in hit.snippet" :key="si">
                    <mark v-if="seg.hit">{{ seg.text }}</mark>
                    <template v-else>{{ seg.text }}</template>
                  </template>
                </span>
                <span v-if="hit.tags.length" class="tags">
                  <span v-for="tag in hit.tags.slice(0, 4)" :key="tag" class="tag">{{ tag }}</span>
                </span>
              </a>
            </li>
          </ul>

          <p v-else class="state">
            Nothing matches <strong>{{ query }}</strong
            >.
          </p>
        </template>
      </div>

      <div class="foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
        <span><kbd>↵</kbd> open</span>
        <span><kbd>esc</kbd> close</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrim {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 10vh 1rem 2rem;
  background: color-mix(in srgb, var(--ink) 32%, transparent);
  backdrop-filter: blur(2px);
}

.panel {
  width: 100%;
  max-width: 40rem;
  max-height: 74vh;
  display: flex;
  flex-direction: column;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: 3px;
  box-shadow: 0 24px 60px -12px color-mix(in srgb, var(--ink) 28%, transparent);
  overflow: hidden;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.field {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--rule);
}

.prompt {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--accent);
}

.input {
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: var(--ink);
  font-family: var(--font-mono);
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}
.input:focus {
  outline: none;
}
.input::placeholder {
  color: var(--ink-muted);
}

.close {
  flex: none;
  padding: 0.15rem 0.4rem;
  border: 1px solid var(--rule);
  border-radius: 2px;
  background: var(--sunk);
  color: var(--ink-muted);
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  cursor: pointer;
}
.close:hover {
  color: var(--accent);
  border-color: var(--accent-soft);
}

.body {
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.35rem 0;
}

.group {
  margin: 0.5rem 1rem 0.35rem;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.results {
  list-style: none;
  margin: 0;
  padding: 0;
}

.result a {
  display: block;
  padding: 0.6rem 1rem;
  text-decoration: none;
  color: inherit;
  border-left: 2px solid transparent;
}

.result.active a {
  background: var(--sunk);
  border-left-color: var(--accent);
}

.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.title {
  font-family: var(--font-serif);
  font-size: 1.02rem;
  line-height: 1.3;
  color: var(--ink);
}

.date {
  flex: none;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.snip {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  line-height: 1.45;
  color: var(--ink-muted);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.35rem;
}

.tag {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-muted);
  border: 1px solid var(--rule);
  border-radius: 2px;
  padding: 0 0.3rem;
}

mark {
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  color: var(--ink);
  border-radius: 1px;
}

.state {
  margin: 1.4rem 1rem;
  font-size: 0.88rem;
  color: var(--ink-muted);
}
.state a {
  color: var(--accent);
}

.foot {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--rule);
  background: var(--sunk);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

kbd {
  font-family: inherit;
  font-size: 0.62rem;
  border: 1px solid var(--rule);
  border-radius: 2px;
  background: var(--paper);
  padding: 0 0.22rem;
  margin-right: 0.15rem;
}
</style>
