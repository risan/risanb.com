---
title: Setting Up Tailwind CSS with Vue CLI
date: 2020-03-07T22:16:00+07:00
tags: [vue, css]
categories: [snippet]
description: A simple trick using axios to handle error response that uses 200 status code.
---
It's quite easy to set up Tailwind CSS within your Vue CLI project. Since Vue CLI is already shipped with PostCSS, all we have to do is to install Tailwind as a PostCSS plugin. If you look at this [Vue CLI source code](https://github.com/vuejs/vue-cli/blob/1a0b59142aa8797810ca90705290d960a4ee6d1e/packages/%40vue/cli-service/lib/config/css.js#L76-L90), you'll notice that Vue CLI will look through every possible PostCSS config file.

```js
const hasPostCSSConfig = !!(loaderOptions.postcss || api.service.pkg.postcss || findExisting(api.resolve('.'), [
  '.postcssrc',
  '.postcssrc.js',
  'postcss.config.js',
  '.postcssrc.yaml',
  '.postcssrc.json'
]))
```

If the config file is not found, it will create a PostCSS config object where `autoprefixer` is loaded as a plugin.

```js
if (!hasPostCSSConfig) {
  loaderOptions.postcss = {
    plugins: [
      require('autoprefixer')
    ]
  }
}
```

To set up Tailwind, first, we need to install Tailwind CSS:

```bash
$ npm install tailwindcss
```

Next, we have to create a new PostCSS config file on the root directory. Let's create one named `postcss.config.js`:

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ]
}
```

And that's pretty much it. Now, all we have to do is to inject Tailwind's `base`, `components`, and `utilities` on our CSS file.

```cs
// /src/styles.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// rest of css...
```

If we import this CSS file, we can start using Tailwind utility classes on our Vue components.

```js
// /src/main.js
import Vue from 'vue';
import App from './App.vue';
import './style.css';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
```
