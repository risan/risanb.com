/**
 * A custom Shiki theme for the Technical Monograph design.
 *
 * Two reasons this is hand-built rather than a stock theme:
 *
 * 1. Palette fit. The site is warm newsprint (#FBF9F5 paper, #F3EFE7 code
 *    surface). Stock light themes are cool-toned — Catppuccin Latte renders
 *    blues and greys that sit oddly on warm paper. This palette is warm and
 *    bookish: burnt sienna for keywords, olive for strings, slate blue for
 *    functions, ochre for numbers.
 *
 * 2. Correctness. Expressive Code's two-theme mode switches token colours via
 *    `prefers-color-scheme`, but this site has a fixed light surface. A
 *    dark-mode visitor would therefore get dark-theme token colours (light
 *    greys) on the light background — measured at 1.32:1 contrast, with all 11
 *    token colours failing WCAG AA. Shipping a single theme removes the switch
 *    entirely, so every visitor gets the palette below.
 *
 * Every foreground here was checked against the #F3EFE7 code surface and passes
 * WCAG AA (>= 4.5:1) for body-size text. Measured ratios are noted per scope.
 */
export const monographLight = {
  name: 'monograph-light',
  type: 'light',
  colors: {
    'editor.background': '#F3EFE7',
    'editor.foreground': '#1B1C1D',
  },
  tokenColors: [
    // default text — 14.88:1
    { settings: { foreground: '#1B1C1D' } },

    // comments — 4.68:1
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: { foreground: '#6F6A62', fontStyle: 'italic' },
    },

    // strings — 6.77:1
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'string.regexp',
        'punctuation.definition.string',
        'constant.other.symbol',
      ],
      settings: { foreground: '#3F5A28' },
    },

    // keywords, tags, storage — 7.05:1
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.operator.new',
        'storage',
        'storage.type',
        'storage.modifier',
        'entity.name.tag',
        'punctuation.definition.tag',
        'markup.heading.marker',
      ],
      settings: { foreground: '#8C3312' },
    },

    // functions, classes, types — 7.52:1
    {
      scope: [
        'entity.name.function',
        'entity.name.type',
        'entity.name.class',
        'support.function',
        'support.class',
        'support.type',
        'variable.function',
        'meta.function-call',
      ],
      settings: { foreground: '#2F4E6E' },
    },

    // numbers, booleans, language constants — 5.53:1
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.language.boolean',
        'support.constant',
        'variable.language',
      ],
      settings: { foreground: '#7A5A1F' },
    },

    // attributes, object keys, CSS properties — 6.65:1
    {
      scope: [
        'entity.other.attribute-name',
        'support.type.property-name',
        'entity.name.tag.css',
        'meta.object-literal.key',
      ],
      settings: { foreground: '#3A5A7A' },
    },

    // brackets, separators — 4.84:1
    {
      scope: [
        'punctuation',
        'punctuation.separator',
        'punctuation.terminator',
        'punctuation.definition.block',
        'meta.brace',
      ],
      settings: { foreground: '#6B6862' },
    },

    // plain identifiers — near-ink so code reads as text, not confetti
    {
      scope: ['variable', 'variable.other', 'variable.parameter', 'entity.name.variable'],
      settings: { foreground: '#2A2B2D' },
    },

    // markdown / inline markup inside docs snippets
    { scope: ['markup.bold'], settings: { foreground: '#1B1C1D', fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { foreground: '#6F6A62', fontStyle: 'italic' } },
    { scope: ['markup.underline.link', 'string.other.link'], settings: { foreground: '#8C3312' } },
    { scope: ['markup.quote'], settings: { foreground: '#6F6A62' } },

    // diffs
    { scope: ['diff.deleted', 'invalid'], settings: { foreground: '#8C3312' } },
    { scope: ['diff.inserted'], settings: { foreground: '#3F5A28' } },
    { scope: ['diff.changed'], settings: { foreground: '#7A5A1F' } },
  ],
};
