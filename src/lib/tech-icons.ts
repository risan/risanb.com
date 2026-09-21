const VALID_TECH_ICONS: Record<string, true> = {
  apollo: true,
  babel: true,
  circleci: true,
  docker: true,
  express: true,
  'google-maps': true,
  graphql: true,
  hugo: true,
  javascript: true,
  js: true,
  laravel: true,
  maps: true,
  node: true,
  nunjucks: true,
  php: true,
  python: true,
  react: true,
  rollup: true,
  vue: true,
  webpack: true,
};

export function getPostIcon(post: {
  data: {
    images?: string[];
    tags?: string[];
  };
}): string | null {
  // 1. Primary source: check images array (e.g. /img/google-maps.png -> google-maps)
  if (post.data.images && post.data.images.length > 0) {
    for (const img of post.data.images) {
      const match = img.match(/\/img\/([^.]+)\.(png|jpe?g|svg|webp)/i);
      if (match) {
        const name = match[1].toLowerCase();
        if (VALID_TECH_ICONS[name]) {
          return name;
        }
      }
    }
  }

  // 2. Secondary source: check if post has a specific tech brand tag
  if (post.data.tags && post.data.tags.length > 0) {
    const priority = [
      'google-maps',
      'maps',
      'rollup',
      'webpack',
      'react',
      'vue',
      'laravel',
      'php',
      'python',
      'docker',
      'graphql',
      'apollo',
      'hugo',
      'node',
      'javascript',
      'babel',
      'express',
      'nunjucks',
      'circleci',
    ];
    for (const p of priority) {
      if (post.data.tags.includes(p)) return p;
    }
  }

  return null;
}
