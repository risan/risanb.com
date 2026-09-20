import { visit } from 'unist-util-visit';

/** Text nodes that are only whitespace don't count as "content" in a paragraph. */
const isBlank = (node) => node.type === 'text' && node.value.trim() === '';

/**
 * Reproduces Hugo's `layouts/_default/_markup/render-image.html` render hook.
 *
 * Hugo wrapped every standalone markdown image as:
 *
 *   <figure>
 *     <a href="{raw destination}"><img src="{processed}" alt="{text}"></a>
 *     <figcaption>{text}</figcaption>
 *   </figure>
 *
 * Two deliberate deviations, both measured against the Hugo reference build
 * (/tmp/hugo-ref) rather than assumed:
 *
 * 1. The <a> wrapper is dropped. It existed to let a reader click through to
 *    full resolution, because Hugo downscaled the displayed image to 1080px
 *    wide. Astro emits the image at its original resolution and — with
 *    markdown.image.layout = 'constrained' — a srcset, so there is no smaller
 *    rendition to escape from. Worse, the raw destination no longer exists at
 *    that URL: Astro moves optimised assets to /_astro/<name>.<hash>.webp, so
 *    reproducing Hugo's href verbatim would emit a guaranteed 404.
 *
 * 2. The <p> wrapper is dropped rather than reproduced. Hugo emitted
 *    `<p><figure>...</figure></p>`, which is invalid: <figure> is flow content
 *    and cannot sit inside <p>. Browsers auto-close the paragraph, so the
 *    effective DOM is already `<p></p><figure>…</figure>`. Emitting a bare
 *    <figure> therefore produces the same rendered result with valid markup.
 *
 * Everything else matches: figure wraps the image, figcaption is the alt text,
 * and no figcaption is emitted when the alt text is empty.
 *
 * Note this works on the HAST tree, so literal `<img …>` text inside fenced
 * code blocks (7 occurrences across the code posts, all Hugo-template samples)
 * is a text node and can never be matched here.
 */
export function rehypeFigure() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'p') return;
      if (index === undefined || parent === undefined) return;

      // A standalone image is the paragraph's only non-whitespace child.
      // Images inline within a sentence are left untouched.
      const content = node.children.filter((child) => !isBlank(child));
      if (content.length !== 1) return;

      const img = content[0];
      if (img.type !== 'element' || img.tagName !== 'img') return;

      const rawAlt = img.properties?.alt;
      const caption = typeof rawAlt === 'string' ? rawAlt.trim() : '';

      const wrapper = {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [
          img,
          ...(caption
            ? [
                {
                  type: 'element',
                  tagName: 'figcaption',
                  properties: {},
                  children: [{ type: 'text', value: caption }],
                },
              ]
            : []),
        ],
      };

      parent.children[index] = wrapper;
    });
  };
}
