// Tech stack SVG icons for post listings and tag pills.
// Styled with CSS filter: grayscale(100%) by default and grayscale(0%) on hover.

export const icons: Record<string, string> = {
  // Google Maps / Maps
  'google-maps': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 1.94.79 3.69 2.06 4.96l4.94-4.96V2z" fill="#4285F4"/>
    <path d="M12 9v5.99l5.06-5.04C15.79 8.69 14.04 7.9 12 7.9V9z" fill="#FBBC04"/>
    <path d="M12 14.99L7.06 19.95C8.42 21.24 10.14 22 12 22s3.58-.76 4.94-2.05L12 14.99z" fill="#34A853"/>
    <circle cx="12" cy="9" r="2.8" fill="#FFFFFF"/>
  </svg>`,
  'maps': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
    <circle cx="12" cy="9" r="3" fill="#FFFFFF"/>
  </svg>`,

  // Rollup
  'rollup': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.5l8.5 4.9v9.8L12 22l-8.5-4.8V7.4L12 2.5z" fill="#EC4A3F"/>
    <path d="M12 2.5l8.5 4.9L12 12.3 3.5 7.4 12 2.5z" fill="#FF6536"/>
    <path d="M12 12.3v9.7l8.5-4.8v-9.8L12 12.3z" fill="#CF3730"/>
    <circle cx="8" cy="6.2" r="1" fill="#FFFFFF"/>
    <circle cx="16" cy="6.2" r="1" fill="#FFFFFF"/>
    <circle cx="12" cy="7.4" r="1" fill="#FFFFFF"/>
    <circle cx="16.25" cy="14" r="1" fill="#FFFFFF"/>
    <circle cx="7.75" cy="14" r="1" fill="#FFFFFF"/>
  </svg>`,

  // Webpack
  'webpack': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.2l8.8 5.1v10.2L12 22.6l-8.8-5.1V7.3L12 2.2z" fill="#8DD6F9" stroke="#1C78C0" stroke-width="0.8"/>
    <path d="M12 6.5l4.8 2.8v5.6L12 17.7l-4.8-2.8V9.3L12 6.5z" fill="#1C78C0"/>
    <path d="M12 2.2v4.3m8.8 5.1l-4 2.3m4 7.9l-4.8-2.8m-8 2.8l4.8-2.8m-8.8-7.9l4-2.3M12 17.7v4.9" stroke="#1C78C0" stroke-width="0.8"/>
  </svg>`,

  // JavaScript
  'javascript': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" fill="#F7DF1E"/>
    <path d="M7 17.8c.8.5 1.7.8 2.6.8 1.4 0 2.2-.7 2.2-2.1v-6.9h-1.9v6.9c0 .6-.3.9-.9.9-.5 0-1-.2-1.4-.4l-.6 1.7zm6.7-.1c1.2.6 2.5 1 3.8 1 2.3 0 3.7-1.1 3.7-3 0-1.7-1-2.4-2.6-3.1-.9-.4-1.5-.7-1.5-1.3 0-.5.4-.9 1.2-.9.8 0 1.6.3 2.2.7l.6-1.6c-.7-.4-1.7-.7-2.8-.7-2.1 0-3.3 1.2-3.3 2.8 0 1.6 1 2.4 2.5 3 .9.4 1.6.7 1.6 1.4 0 .6-.5 1-1.4 1-.9 0-1.9-.4-2.6-.9l-.6 1.6z" fill="#000000"/>
  </svg>`,
  'js': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" fill="#F7DF1E"/>
    <path d="M7 17.8c.8.5 1.7.8 2.6.8 1.4 0 2.2-.7 2.2-2.1v-6.9h-1.9v6.9c0 .6-.3.9-.9.9-.5 0-1-.2-1.4-.4l-.6 1.7zm6.7-.1c1.2.6 2.5 1 3.8 1 2.3 0 3.7-1.1 3.7-3 0-1.7-1-2.4-2.6-3.1-.9-.4-1.5-.7-1.5-1.3 0-.5.4-.9 1.2-.9.8 0 1.6.3 2.2.7l.6-1.6c-.7-.4-1.7-.7-2.8-.7-2.1 0-3.3 1.2-3.3 2.8 0 1.6 1 2.4 2.5 3 .9.4 1.6.7 1.6 1.4 0 .6-.5 1-1.4 1-.9 0-1.9-.4-2.6-.9l-.6 1.6z" fill="#000000"/>
  </svg>`,

  // PHP
  'php': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="12" rx="11" ry="6.5" fill="#777BB4"/>
    <text x="12" y="14" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="7.5" text-anchor="middle" letter-spacing="-0.5">php</text>
  </svg>`,

  // Laravel
  'laravel': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.8 6.5l-4-2.3a.6.6 0 00-.6 0L4.5 10.4c-.2.1-.3.3-.3.6v8.4c0 .2.1.4.3.5l4 2.3c.2.1.5.1.6 0l10.7-6.2c.2-.1.3-.3.3-.6V7.1c0-.3-.1-.5-.3-.6zm-4.3-.9l2.7 1.6-4.5 2.6-2.7-1.6 4.5-2.6zm-5.1 14l-2.7-1.6V12l2.7 1.6v7zm1-7.9l-2.7-1.6 8.5-4.9 2.7 1.6-8.5 4.9zm7.5 3.3l-2.7 1.6V12l2.7-1.6v4.6z" fill="#FF2D20"/>
  </svg>`,

  // Vue
  'vue': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3h4.3L12 13 17.7 3H22L12 21 2 3z" fill="#42B883"/>
    <path d="M6.3 3L12 13 17.7 3h-3.4L12 7.2 9.7 3H6.3z" fill="#35495E"/>
  </svg>`,

  // React
  'react': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" stroke-width="1.2" transform="rotate(0 12 12)"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" stroke-width="1.2" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" stroke="#61DAFB" stroke-width="1.2" transform="rotate(120 12 12)"/>
    <circle cx="12" cy="12" r="1.8" fill="#61DAFB"/>
  </svg>`,

  // Python
  'python': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.9 2.1c-4.3 0-4 .9-4 2.8v2.1h8.2V8H6.7C3.8 8 2 9.8 2 12.6c0 3.3 1.9 4.3 4.9 4.3h1.8v-2.3c0-2.2 1.9-4.1 4.1-4.1h7.1c.6 0 1.2-.6 1.2-1.2V6.8c0-3.1-2.9-4.7-9.2-4.7zm-2.3 2.1c.6 0 1.1.5 1.1 1.1s-.5 1.1-1.1 1.1-1.1-.5-1.1-1.1.5-1.1 1.1-1.1z" fill="#3776AB"/>
    <path d="M12.1 21.9c4.3 0 4-.9 4-2.8V17H7.9V16h9.4c2.9 0 4.7-1.8 4.7-4.6 0-3.3-1.9-4.3-4.9-4.3h-1.8v2.3c0 2.2-1.9 4.1-4.1 4.1H4.1c-.6 0-1.2.6-1.2 1.2v2.5c0 3.1 2.9 4.7 9.2 4.7zm2.3-2.1c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z" fill="#FFD438"/>
  </svg>`,

  // Babel
  'babel': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="3" fill="#F9DC3E"/>
    <path d="M5.5 6.5h6.3c2.4 0 3.7 1.1 3.7 2.6 0 1-.6 1.9-1.6 2.3 1.3.4 2.1 1.4 2.1 2.7 0 1.8-1.5 2.9-4 2.9H5.5V6.5zm3.1 4.2h2.7c.9 0 1.4-.4 1.4-1 0-.6-.5-1-1.4-1H8.6v2zm0 4.1h3c1 0 1.6-.4 1.6-1.1 0-.7-.6-1.1-1.6-1.1h-3v2.2z" fill="#000000"/>
  </svg>`,

  // Apollo / GraphQL
  'apollo': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 22h20L12 2zm0 4.8l6.7 13.2H5.3L12 6.8z" fill="#311C87"/>
    <path d="M12 11l-3 6h6l-3-6z" fill="#112B4A"/>
  </svg>`,
  'graphql': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" stroke="#E10098" stroke-width="1.5" fill="none"/>
    <path d="M12 2v20M3.34 7l17.32 10M3.34 17L20.66 7" stroke="#E10098" stroke-width="1.2"/>
    <circle cx="12" cy="2" r="2" fill="#E10098"/>
    <circle cx="20.66" cy="7" r="2" fill="#E10098"/>
    <circle cx="20.66" cy="17" r="2" fill="#E10098"/>
    <circle cx="12" cy="22" r="2" fill="#E10098"/>
    <circle cx="3.34" cy="17" r="2" fill="#E10098"/>
    <circle cx="3.34" cy="7" r="2" fill="#E10098"/>
  </svg>`,

  // CircleCI
  'circleci': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#000000" stroke-width="3.5" fill="none"/>
    <circle cx="12" cy="12" r="4.5" fill="#343434"/>
    <path d="M12 2a10 10 0 0110 10" stroke="#05A649" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`,

  // Express
  'express': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#000000"/>
    <text x="12" y="16.5" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="800" font-size="11" text-anchor="middle" font-style="italic">ex</text>
  </svg>`,

  // Node.js
  'node': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l9 5.2v10.4l-9 5.2-9-5.2V7.2L12 2z" fill="#339933"/>
    <path d="M12 5.5l6.5 3.8v7.4L12 20.5 5.5 16.7V9.3L12 5.5z" fill="#539E43"/>
    <text x="12" y="15" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="900" font-size="8.5" text-anchor="middle">JS</text>
  </svg>`,

  // Nunjucks
  'nunjucks': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#1C491C"/>
    <path d="M6 18V6l5 6v6L6 18zm7 0V6l5 6v6l-5-6z" fill="#2CA02C"/>
  </svg>`,

  // Hugo
  'hugo': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#FF4088"/>
    <path d="M6 6h3.5v4.2h5V6H18v12h-3.5v-4.8h-5V18H6V6z" fill="#FFFFFF"/>
  </svg>`,

  // macOS
  'macos': `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 1.01-2.88-.9.04-2 .6-2.65 1.34-.56.63-1.07 1.67-.94 2.72 1.01.08 2.05-.53 2.58-1.18z"/>
  </svg>`,

  // Linux
  'linux': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.5.7 2.8 1.8 3.7C6.5 11.5 5 14.5 5 18c0 1.5.5 2.5 1.5 3 1.5.8 4 1 5.5 1s4-.2 5.5-1c1-.5 1.5-1.5 1.5-3 0-3.5-1.5-6.5-4.3-7.8 1.1-.9 1.8-2.2 1.8-3.7C16.5 4 14.5 2 12 2z" fill="#FFC107"/>
    <ellipse cx="12" cy="14" rx="4.5" ry="5.5" fill="#FFFFFF"/>
    <ellipse cx="12" cy="6.5" rx="2.5" ry="3" fill="#212121"/>
    <circle cx="11" cy="6" r="0.6" fill="#FFFFFF"/>
    <circle cx="13" cy="6" r="0.6" fill="#FFFFFF"/>
    <polygon points="11,7.5 13,7.5 12,8.8" fill="#FF9800"/>
  </svg>`,

  // DevOps
  'devops': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 8a4 4 0 100 8c2.5 0 4.5-3.5 5-4-.5-.5-2.5-4-5-4zm10 0c-2.5 0-4.5 3.5-5 4 .5.5 2.5 4 5 4a4 4 0 100-8z" stroke="#0078D7" stroke-width="2.2" fill="none"/>
  </svg>`,

  // Docker
  'docker': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 8.5h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm6-3h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm9 6h2v2h-2zm-12 0h2v2H4zm-1 3.5c.5 3.5 3.5 6 7.5 6 5.5 0 9.5-3.5 10.5-7.5-.8-.5-2.5-.5-3.5 0-.5.2-1.5 0-2-.5 0 0-1.5-2-4.5-1.5-2.5.5-3 0-3-.5H3z" fill="#2496ED"/>
  </svg>`,

  // CSS
  'css': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 2l1.6 18 6.9 2 6.9-2 1.6-18H3.5z" fill="#1572B6"/>
    <path d="M12 3.7v16.5l5.5-1.5 1.3-15H12z" fill="#33A9DC"/>
    <path d="M12 7.5H7.2l.3 3h4.5m0 3.2H8.9l.2 2 2.9.8v-2.8m0-6.2h4.8l-.4 4.5h-4.4m0 3.3l2.8-.8.2-1.7H12" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // Jekyll
  'jekyll': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 2h4v4h-4z" fill="#CC0000"/>
    <path d="M11 6h2v6l6 9H5l6-9V6z" fill="#CC0000"/>
    <circle cx="10" cy="16" r="1.2" fill="#FFFFFF"/>
    <circle cx="14" cy="18" r="1.5" fill="#FFFFFF"/>
    <circle cx="13" cy="13" r="0.8" fill="#FFFFFF"/>
  </svg>`,

  // Nginx
  'nginx': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l9 5.2v10.4L12 22.8l-9-5.2V7.2L12 2z" fill="#009639"/>
    <path d="M8 7.5v9h2.2l4-6.5v6.5h2.3v-9h-2.2l-4 6.5v-6.5H8z" fill="#FFFFFF"/>
  </svg>`,

  // Windows
  'windows': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5.5l7-1v7H3v-6zm8-1.2l10-1.5v8.7H11V4.3zM3 12.5h7v7.2l-7-1v-6.2zm8 0h10v8.7l-10-1.4v-7.3z" fill="#0078D4"/>
  </svg>`,

  // Machine Learning
  'machine-learning': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="#8B5CF6"/>
    <circle cx="7" cy="8" r="2" fill="#FFFFFF"/>
    <circle cx="7" cy="16" r="2" fill="#FFFFFF"/>
    <circle cx="17" cy="8" r="2" fill="#FFFFFF"/>
    <circle cx="17" cy="16" r="2" fill="#FFFFFF"/>
    <circle cx="12" cy="12" r="2.2" fill="#FFFFFF"/>
    <path d="M7 8l5 4m-5 4l5-4m5-4l-5 4m5 4l-5-4" stroke="#FFFFFF" stroke-width="1.2"/>
  </svg>`,

  // Swift
  'swift': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.5 17.5c-3-2-5-5-5-8.5 0-1.2.2-2.3.6-3.3-3.4 2.8-5.6 7-5.6 11.8 0 1.5.2 2.9.7 4.2-2-1.5-3.5-3.6-4.2-6.1-.2-.7-.3-1.4-.4-2.1-1.3 2.1-1.6 4.6-1.1 7.2.2 1 .6 2 1.2 2.8 1.2 1.6 3 2.8 5 3.5 1.5.5 3.1.7 4.8.5 4.5-.4 8.2-3.8 9-8-.3-.7-.7-1.4-1-2z" fill="#FA7343"/>
  </svg>`,
};

export function getTechIconSvg(name: string): string | null {
  const key = name.toLowerCase().trim();
  if (icons[key]) return icons[key];
  if (key === 'js') return icons['javascript'];
  if (key === 'maps') return icons['google-maps'];
  return null;
}
