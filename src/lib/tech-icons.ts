export function getPostIcon(post: {
  data: {
    images?: string[];
    tags?: string[];
  };
}): string | null {
  // 1. Check images array (e.g. /img/google-maps.png -> google-maps)
  if (post.data.images && post.data.images.length > 0) {
    for (const img of post.data.images) {
      const match = img.match(/\/img\/([^.]+)\.(png|jpe?g|svg|webp)/i);
      if (match) {
        const name = match[1].toLowerCase();
        if (name !== 'default-og' && name !== 'risan-og') {
          return name;
        }
      }
    }
  }

  // 2. Check tags array with priority for specific technologies
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
      'node',
      'docker',
      'graphql',
      'apollo',
      'hugo',
      'css',
      'devops',
      'linux',
      'macos',
      'windows',
      'machine-learning',
      'swift',
      'nginx',
      'jekyll',
      'javascript',
      'babel',
      'express',
      'nunjucks',
      'circleci',
    ];
    for (const p of priority) {
      if (post.data.tags.includes(p)) return p;
    }
    return post.data.tags[0];
  }

  return null;
}
