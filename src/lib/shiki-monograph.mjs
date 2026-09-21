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

export const monographDark = {
  name: 'monograph-dark',
  type: 'dark',
  colors: {
    'editor.background': '#1C1D20',
    'editor.foreground': '#E6E4DF',
  },
  tokenColors: [
    // default text
    { settings: { foreground: '#E6E4DF' } },

    // comments
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#8E8B83', fontStyle: 'italic' },
    },

    // strings
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'punctuation.definition.string',
      ],
      settings: { foreground: '#9EC47C' },
    },

    // keywords, tags, storage
    {
      scope: [
        'keyword',
        'keyword.control',
        'keyword.operator.new',
        'keyword.operator.expression',
        'storage.type',
        'storage.modifier',
        'entity.name.tag',
      ],
      settings: { foreground: '#E57955' },
    },

    // functions, classes, types
    {
      scope: [
        'entity.name.function',
        'support.function',
        'entity.name.type',
        'entity.name.class',
        'support.class',
        'support.type',
      ],
      settings: { foreground: '#82AAFF' },
    },

    // numbers, booleans, language constants
    {
      scope: [
        'constant.numeric',
        'constant.language',
        'constant.character',
        'constant.other',
      ],
      settings: { foreground: '#EBB369' },
    },

    // attributes, object keys, CSS properties
    {
      scope: [
        'entity.other.attribute-name',
        'variable.other.property',
        'meta.object-literal.key',
        'support.type.property-name',
      ],
      settings: { foreground: '#D89E7C' },
    },

    // brackets, separators
    {
      scope: [
        'punctuation.separator',
        'punctuation.terminator',
        'meta.brace',
        'punctuation.definition.parameters',
      ],
      settings: { foreground: '#A3A097' },
    },

    // plain identifiers
    {
      scope: [
        'variable',
        'variable.other',
        'variable.parameter',
        'meta.definition.variable',
      ],
      settings: { foreground: '#E6E4DF' },
    },

    // markdown / inline markup
    { scope: ['markup.bold'], settings: { foreground: '#E6E4DF', fontStyle: 'bold' } },
    { scope: ['markup.italic'], settings: { foreground: '#8E8B83', fontStyle: 'italic' } },
    { scope: ['markup.underline.link', 'string.other.link'], settings: { foreground: '#E57955' } },
    { scope: ['markup.quote'], settings: { foreground: '#8E8B83' } },

    // diffs
    { scope: ['diff.deleted', 'invalid'], settings: { foreground: '#F07178' } },
    { scope: ['diff.inserted'], settings: { foreground: '#9EC47C' } },
    { scope: ['diff.changed'], settings: { foreground: '#EBB369' } },
  ],
};
