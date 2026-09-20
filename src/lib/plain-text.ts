/**
 * Flatten a markdown body to searchable prose.
 *
 * Approximate by design: this feeds the search index, not the renderer, so the
 * goal is that any token a reader could see is findable. Being lossy is fine;
 * being wrong about *structure* is not, which is why the rules run in a fixed
 * order (strip code fences and HTML before unwrapping link syntax).
 *
 * Kept separate from the endpoint so the index and the modal's snippet
 * highlighting can agree on what "the text of a post" means.
 */
export function toPlainText(markdown: string): string {
  return (
    markdown
      // Hugo shortcodes. The remark plugin removes these at render time, but the
      // raw body still carries them, and `{{< youtube id="x" >}}` would
      // otherwise make "youtube" and "id" searchable noise.
      .replace(/\{\{[<%][\s\S]*?[>%]\}\}/g, ' ')
      // Fenced-code fences and their language tags. The code itself stays: on a
      // code blog, searching for an identifier is a primary use case.
      .replace(/^\s*```.*$/gm, ' ')
      // Raw HTML — mostly <figure>/<figcaption> that rehype will rebuild.
      .replace(/<[^>]+>/g, ' ')
      // Images: the alt text is what a reader sees.
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      // Links: keep the label, drop the target.
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
      // Link reference definitions.
      .replace(/^\s*\[[^\]]*\]:\s*\S+.*$/gm, ' ')
      // Leading block markers: headings, quotes, list items, ordered items.
      .replace(/^\s{0,3}(?:#{1,6}|>|[-*+]|\d+\.)\s+/gm, ' ')
      // Table pipes.
      .replace(/\|/g, ' ')
      // Emphasis, strikethrough and inline-code delimiters.
      .replace(/[*_~`]/g, ' ')
      // Thematic breaks.
      .replace(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}
