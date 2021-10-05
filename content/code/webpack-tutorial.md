---
title: A Hands-On Guide to Learn Webpack
description: > 
    A hands-on guide to learn Webpack step-by-step. How to use Webpack with Babel, processing CSS and
    SASS files, optimizing images, strip unused CSS rules, even developing your own Webpack plugin.
date: 2017-08-06T21:00:00+02:00
categories: [tutorial]
tags: [javascript, webpack]
images: [/img/webpack.png]
featured: true
---
{{<toc>}}

## Webpack Zero Configuration

Create `package.json` file:

```bash
$ npm init -y
```

Install webpack locally:

```bash
$ yarn add webpack -D
```

Create a sample js file:

```js
// src/app.js
console.log('Hello World!');
```

Compile it down with webpack even without a configuration:

```bash
./node_modules/.bin/webpack src/app.js dist/bundle.js
```

Watch for file changes and recompile automatically:

```bash
./node_modules/.bin/webpack src/app.js dist/bundle.js --watch
```

We can store those commands within NPM scripts:

```json
"scripts": {
    "build": "webpack src/app.js dist/bundle.js",
    "watch": "webpack src/app.js dist/bundle.js --watch"
},
```

Or even shorter:

```json
"scripts": {
    "build": "webpack src/app.js dist/bundle.js",
    "watch": "npm run build -- --watch"
},
```

Note that we don’t need to use a full path when calling `webpack` within the npm scripts, it will assume a local installation. Also note that we use an extra `—` to pass a parameter. Now we can simply run:

```bash
npm run build #or
npm run watch
```

## Dedicated Webpack Config File

You can also provide webpack with configuration file like so:

```bash
./node_modules/.bin/webpack --config=myconfig.js
```

And by default webpack will look for a configuration file named `webpack.config.js` on the current directory.  Create one like this:

```js
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  }
};
```

Note that webpack needs an absolute path to the output’s directory (the `path` parameter).

With this configuration file, our NPM scripts now will be simpler:

```json
"scripts": {
    "build": "webpack",
    "watch": "webpack --watch"
}
```

## Modules are Simply Files

### ES2015 Module

Suppose we have an ES2015 module for notification like this:

```js
// Notification.js
export default function(message) {
  console.log(message);
}
```

We can than use it in our main file like so:

```js
// App.js
import notify from './Notification';

notify('Hello!!');
```

### Common JS Module

Webpack also support the common js format:

```js
// Notification.js
module.exports = function(message) {
  console.log(message);
}

// App.js
const notify = require('./Notification');

notify('Hello!!');
```

### Non Default Export

If we `export` a module but do not use the `default` keyword, we have to explicitly specify the class/function/variable name:

```js
// Notification.js
export function notify(message) {
  alert(message);
}

// App.js
import { notify } from './Notification';

notify('Hello!');
```

### Multiple Export In 1 File

ES2015 allows us to export multiple classes/functions/variables:

```js
// Notification.js
export default function(message) {
  alert(message);
}

export function log(message) {
  console.log(message);
}

export function fireEmojis() {
  console.log('🔥🔥🔥🔥');
}
```

Then we can use it like this:

```js
// App.js
import notify, { log, fireEmojis } from './Notification';

notify('Hello!');
log('Hello!');
fireEmojis();
```

Note that only 1 `default` is allowed within 1 module file. And to import a non-default class/function/variable, you have to use curly braces: `{ log, fireEmojis }`.

Although we are allowed to use multiple export, it’s always a good idea to keep our module simple and only exposed one default class/function/variable.

## Loaders are Transformers

Webpack’s loaders allow us to transform and preprocess any number of file types.

### CSS Loader

Suppose we have a CSS file like this:
```css
/* src/style.css */
body {
  background: red;
}
```

Then we’d like to require this CSS file within our `app.js` file:

```js
// src/app.js
require('./style.css');
```

If you compile down with our current webpack configuration, it will throw you an error like this:

```bash
ERROR in ./src/style.css
Module parse failed: /Users/risan/repo/webpack.dev/src/style.css Unexpected token (1:5)
You may need an appropriate loader to handle this file type.
```

We’re going to need the `css-loader` to process this CSS file:

```bash
$ yarn add css-loader -D
```

Then we need to configure our webpack configuration:

```js
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: 'css-loader'
      }
    ]
  }
};
```

The `test` parameter contains a regular expression for targeting the CSS files, while the `use` parameter contains the loader’s name to apply to. With this configuration you can now successfully compile down our `app.js` file.

### Style Loader

We can now compile down our `app.js` successfully, but the CSS rule on `style.css` is not applied to our page. We need `style-loader` to inject the CSS to the page.

```bash
$ yarn add style-loader -D
```

Then add it to the `use` parameter:

```js
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
```

Note that the loaders registered on `use` parameter will be applied from right to left. So in our case the `css-loader` will be applied first then the `style-loader`. Now you’ll see that our page will have a red-background now.

## ES2015 Compilation with Babel

Suppose we use ES2015 standard in our code:

```js
// src/Person.js
export default class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hello my name is ${this.name}.`);
  }
}
```

And our main `app.js` file looks like this:

```js
import Person from './Person';

let risan = new Person('Risan');
risan.greet();
```

With Webpack’s loader we can also compile our ES2015 code. First install Babel and it’s webpack loader:

```bash
$ yarn add babel-loader babel-core -D
```

Install the ES2015 preset:

```bash
$ yarn add babel-preset-es2015 -D
```

Create the `.babelrc` file:

```json
{
  "presets": ["es2015"]
}
```

Then finally register our Babel loader into our webpack configuration:

```js
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};
```

## Minification & Environment

To minify the compiled file with Webpack, you can just simply register the `uglify` plugin like so:

```js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
};
```

If we want to minify the file on production, we can check for the `NODE_ENV` environment variable like so:

```js
const path = require('path');
const webpack = require('webpack');
const isInProduction = (process.env.NODE_ENV === 'production');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: []
};

if (isInProduction) {
  module.exports.plugins.push(
      new webpack.optimize.UglifyJsPlugin()
  );
}
```

If the `NODE_ENV` is not setup yet, you can also pass it into the command line:

```bash
$ NODE_ENV=production ./node_modules/.bin/webpack
``` 

Or we can also update our NPM scripts:

```json
{
  "name": "webpack.dev",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "dev": "webpack",
    "production": "NODE_ENV=production webpack",
    "watch": "npm run build -- --watch"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "babel-core": "^6.25.0",
    "babel-loader": "^7.1.1",
    "babel-preset-es2015": "^6.24.1",
    "webpack": "^3.4.1"
  }
}
```

## SASS Compilation

Suppose you have an `scss` file like this:

```scss
// src/style.scss
$primary: green;

body {
  background: $primary;
}
```

And on your main file, you imported that scss file like so:

```js
require('./style.scss');
```

How do you compile sass file using Webpack?

Worry not, there’s a loader for that! Make sure you have `libsass` install on your computer:

```bash
$ brew install lib sass
```

Now add the `node-sass` and the webpack `sass-loader` to your project’s dependencies:

```bash
$ yarn add sass-loader node-sass -D
```

Now update your webpack’s configuration file like so:

```js
const path = require('path');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      }
    ]
  }
};
```

Remember that the loaders registered on `use` will be applied from right to left. Also note that the `test: /\.s[ac]ss$/` will match both `.sass` and `.scss` file extensions.

## Extract CSS to a Dedicated File

From the previous section we saw that our compiled CSS from the SCSS file is injected directly to the webpage by the `style-loader`. What if we want to extract the compiled CSS to a dedicated file?

We can use the [`extract-text-webpack-plugin`](https://github.com/webpack-contrib/extract-text-webpack-plugin). Install the extract extract text plugin:

```bash
$ yarn add extract-text-webpack-plugin -D
```

Suppose we have our `scss` file like this:

```scss
$primary: green;

body {
  background: $primary;
}
```

And we import it within our `app.js`:

```js
require('./style.scss');
```

To extract the compiled CSS file, we have to update our webpack configuration like so:

```js
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('style.css')
  ]
};
```

The `use` parameter passes to the `ExtractTextPlugin.extract()` is the loader to preprocess the SCSS file. While the `fallback` parameter contains a loader name that will be used if the CSS file cannot be extracted, on our case it’s the `style-loader` which will inject the CSS into the page directly. Don’t forget to register the plugin and pass the output CSS filename:

```js
plugins: [
  new ExtractTextPlugin('style.css')
]
```

### Naming Our Entry Files

We can give a name to our entry files:

```js
module.exports = {
  entry: {
	  // Named it as main.
    main: './src/app.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js' // Will become main.js
  },
  ...
  plugins: [
    new ExtractTextPlugin('[name].css') // Will become main.css
  ]
};
```

The `[name].js` and the `[name].css` respectfully will be translated to `main.js` and `main.css`, because we named our entry file as `main`.

We can also pass multiple files into our entry:

```js
module.exports = {
  entry: {
    main: [
      './src/app.js',
      './src/style.scss'
    ]
  }
};
```

With this approach we no longer need to import the `style.scss` within our `app.js` in order to make it included in compilation.

### Minify the Extracted CSS

On previous section we learned how to minify the bundled file on production using Webpack `UglifyJsPlugin`, let’s give it a try:

```js
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const isInProduction = (process.env.NODE_ENV === 'production');

module.exports = {
  entry: {
    main: [
      './src/app.js',
      './src/style.scss'
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css')
  ]
};

if (isInProduction) {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin()
  );
}
```

Then we run:

```bash
$ NODE_ENV=production ./node_modules/.bin/webpack
```

You may note that the generated `main.js` is minified but the extracted `main.css` file is not. To solve this issue we can install a plugin: [`optimize-css-assets-webpack-plugin`](https://github.com/NMFR/optimize-css-assets-webpack-plugin)

```bash
$ yarn add optimize-css-assets-webpack-plugin -D
```

Simply register this plugin:

```js
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const isInProduction = (process.env.NODE_ENV === 'production');

module.exports = {
  entry: {
    main: [
      './src/app.js',
      './src/style.scss'
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css')
  ]
};

if (isInProduction) {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin(),
    new OptimizeCssAssetsPlugin()
  );
}
```

By default, it will look for `.css` file and optimize it using `cssnano`, but of course you can tweak this.

## The Relative URL Conundrum

Suppose we have an old project and our images are stored within the public `dist/images` directory. On our `src/style.scss` file we’d like to refer to the `dist/images/test.jpg` file:

```scss
// src/style.scss
body {
  background: url('./images/test.jpg');
}
```

And here’s our webpack’s configuration file:

```js
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    main: [
      './src/app.js',
      './src/style.scss'
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css')
  ]
};
```

And if we compile our files, it will throw us an error:

```bash
Module not found: Error: Can't resolve './images/test.jpg'
```

This is because Webpack cannot find the `test.jpg` file within the `src` directory. How are we going to solve this?

### Ignore the URL in CSS

The easiest fix is to ignore the URL on our CSS, we can do this by passing options to our `css-loader`:

```js
use: ExtractTextPlugin.extract({
  use: [
    {
      loader: 'css-loader',
      options: {
        url: false
      }
    },
    'sass-loader'
  ],
  fallback: 'style-loader'
})
```

### Use raw-loader

The second approach is to use `raw-loader` instead of the `css-loader`, the `raw-loader` will simply export the file without processing it thus won’t bother with the URL on CSS. Install it like this:

```bash
$ yarn add raw-loader -D
```

Replace our `css-loader` like so:

```js
{
  test: /\.s[ac]ss$/,
  use: ExtractTextPlugin.extract({
    use: ['raw-loader', 'sass-loader'],
    fallback: 'style-loader'
  })
}
```

### The Webpack Way

The last one is the webpack way, first we have to move our image's directory to `src/images`. Next we need to install the `file-loader`:

```bash
$ yarn add file-loader
```

This loader will help webpack to handle file and return it as an url. Next we register this loader to handle all the image files:

```js
module: {
  rules: [
    {
      test: /\.s[ac]ss$/,
      use: ExtractTextPlugin.extract({
        use: ['css-loader', 'sass-loader'],
        fallback: 'style-loader'
      })
    },
    {
      test: /\.(png|jpe?g|gif|svg)$/,
      use: 'file-loader'
    }
  ]
}
```

That’s it, if we compile our file the generated `main.css` will look similar to this:

```css
body {
  background: url(e4421469c6f25ae1ac7c267492fee673.jpg); }
```

As you see the `src/images/test.jpg` file is copied to `dist/e4421469c6f25ae1ac7c267492fee673.jpg` and Webpack is smart enough to update the image’s url within the CSS.

Even if we imported a CSS from `node_modules` that contains an image. For example, we have a css from `some-package` like below where the image is located at `node_modules/some-package/img/foobar.jpg`:

```css
/* node_modules/some-package/style.css */
div {
  background: url('./img/foobar.jpg');
}
```

On our `style.scss`, we import that CSS file:

```css
@import '~some-package/style.css';

body {
  background: url('./images/test.jpg');
}
```

And if we compile our file again, our generated `main.css` file will look similar to this:
```css
div {
  background: url(1256a8c3b27439f7a501566d571c92cf.jpg);
}
body {
  background: url(e4421469c6f25ae1ac7c267492fee673.jpg); }
```

You’ll see that the `node_modules/some-package/img/foobar.jpg` will also be copied to `dist/1256a8c3b27439f7a501566d571c92cf.jpg`.

### Keeping the Files Name

As we see previously, our files get copied to `dist` directory and the name is being replaced with a random characters. What if we want to keep the original filename? Worry not, we can pass the `name` option to `file-loader`:

```json
{
  test: /\.(png|jpe?g|gif|svg)$/,
  loader: 'file-loader',
  options: {
    name: '[name].[ext]'
  }
}
```

We can even organize it to a directory like `img` or whatever you prefer:

```json
{
  test: /\.(png|jpe?g|gif|svg)$/,
  loader: 'file-loader',
  options: {
    name: 'img/[name].[ext]'
  }
}
```

We can also add the hash to the filename:

```json
{
  test: /\.(png|jpe?g|gif|svg)$/,
  loader: 'file-loader',
  options: {
    name: 'img/[name]_[hash].[ext]'
  }
}
```

And the nice thing is Webpack will automatically update the URL path on our CSS.

## How to Strip Unused CSS

We often put many rules on our CSS file and most likely some of them are unused within our page. Worry not, there’s a node module for that: [`purifycss`](https://github.com/purifycss/purifycss)

And the great thing is that `purifycss` also able to read our JS file and locate our dynamic CSS selector. First let’s install the module and its webpack plugin:

```bash
$ yarn add purifycss-webpack purify-css -D
```

Suppose we have an HTML file like this:

```html
<html>
    <head>
        <title>Webpack</title>
        <link rel="stylesheet" href="dist/main.css">
    </head>
    <body class="one">
        <h1>Webpack</h1>
        <script src="dist/main.js"></script>
    </body>
</html>
```

And our SCSS file like below, note that the `.two` class is unused:

```scss
// src/style.scss
.one {
  background: red;
}

.two {
  background: green;
}
```

Now let’s configure our webpack configuration to strip-down unused CSS rules using `purifycss`:

```js
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');

module.exports = {
  entry: {
    main: [
      './src/app.js',
      './src/style.scss'
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new PurifyCSSPlugin({
      paths: [path.join(__dirname, 'index.html')]
    })
  ]
};
```

Note that the given `paths` parameter is an array, you can also use `glob` to find a matching pattern:

```js
const glob = require('glob');
// Omitted...
new PurifyCSSPlugin({
  paths: glob.sync(path.join(__dirname, 'resources/views/*.html'))
})
```

If we compile our file, the generated `main.css` will not contain the unused `.two` rule:

```css
/* dist/main.css */
.one {
  background: red;
}
```

### Dynamic CSS Class

Suppose we have our SCSS file like this:

```scss
// src/style.scss
.one {
  background: red;
}

.two {
  background: green;
}

.dynamic {
  background: yellow;
}
```

What if we apply the `dynamic` CSS class dynamically within our JS file like this:

```js
// src/app.js
document.querySelector('body').addEventListener('click', () => {
  document.querySelector('body').className = 'dynamic';
});
```

To make the `purifycss` plugin aware about this dynamic class, we also need to pass our compiled JS file to `paths` parameter so the plugin can traverse it. In order to use `glob` but with multiple path, we can install `glob-all` module first:

```bash
$ yarn add glob-all -D
```

Then configure our `PurifyCSSPlugin` to also include all JS file within the `dist` directory:

```js
const path = require('path');
const glob = require('glob-all');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');

module.exports = {
  entry: {
    main: [
      './src/app.js',
      './src/style.scss'
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new PurifyCSSPlugin({
      paths: glob.sync([
        path.join(__dirname, '*.html'),
        path.join(__dirname, 'dist/*.js')
      ])
    })
  ]
};
```

## Long Term Caching

Suppose we have two entries on our webpack configuration: `app` for our main application logic and `vendor` for our third-party dependencies:

```js
const path = require('path');

module.exports = {
  entry: {
    app: './src/app.js',
    vendor: ['jquery']
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[hash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  }
};
```

Before compiling, don’t forget to add `jQuery` to our dependency list:

```bash
$ yarn add jQuery
```

With the output filename of `[name].[hash].js` , we’ll get two files on our `dist` directory similar to this:

1. `app.9479ddf09100be22e374.js`
2. `vendor.9479ddf09100be22e374.js`

Note that the hash for both files are identical. If we compile it again, the generated hash for both files won’t change. And if we update the `src/app.js` first, the hash for both files will be changed. Well, we don’t want the hash for vendor to be changed, since we don’t alter anything within the vendor’s entry. We only want the hash to be changed if one of the file within its entry is changed.

### Chunkhash

To work around this, we can use `chunkhash` instead of `hash`:

```js
output: {
  path: path.resolve(__dirname, './dist'),
  filename: '[name].[chunkhash].js'
}
```

This way we’ll always get two different hash for both entries like this:

1. `app.fafac58446f689400548.js`
2. `vendor.95c6eae01b5a86d8acb7.js`

And if we update the `src/app.js` and compile it again, only the hash of the `app` entry that will be changed.

### Cleanup Build Directory

As you may have noticed, when the new hash is generated the old file with an old hash is still there cluttering our `dist` directory. What if we want to clean up the old build?

Let’s install the [`clean-webpack-plugin`](https://github.com/johnagan/clean-webpack-plugin)! This will clean up our build directory before compiling:

```bash
$ yarn add clean-webpack-plugin -D
```

Then we add this to`plugins` field within our webpack’s configuration file:

```js
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/app.js',
    vendor: ['jquery']
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: __dirname,
      verbose: true,
      dry: false,
      watch: false,
      exclude: []
    })
  ]
};
```

## Webpack Manifest

On the previous section we successfully add a versioning to our compiled files. But how do we refer to these files on our HTML if the prepended hash is often changes? To solve this we can create a custom plugin that will write a JSON manifest file that contains the filename both from `app` and `vendor` entries:

```js
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/app.js',
    vendor: ['jquery']
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: __dirname,
      verbose: true,
      dry: false,
      watch: false,
      exclude: []
    }),
	  
	  // Our custom plugin.
    function() {
      this.plugin('done', stats => {
        require('fs').writeFileSync(
          path.join(__dirname, 'dist/manifest.json'),
          JSON.stringify(stats.toJson().assetsByChunkName)
        );
      });
    }
  ]
};
``` 

When the webpack is `done` compiling our files, this custom plugin will write a file to `distilled/mainifest.json` that will contain the filename to our entries. Here’s the example result:

```json
{
    "vendor": "vendor.95c6eae01b5a86d8acb7.js",
    "app": "app.1669cd9f67324dfe138b.js"
}
```

We can than read this `manifest.json` and load the compiled files.

## Automatic Image Optimization

Suppose on our stylesheet we refer to a big image `images/test.jpg` like this:

```scss 
// src/style.scss
.body {
  background: url('./images/test.jpg');
}
```

With webpack we can automatically optimize this image. Let’s install the `image-webpack-loader` to do this job:

```bash
$ yarn add image-webpack-loader -D
```

Next we just need to apply this loader when processing images:

```js
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: [
      './src/app.js',
      './src/style.scss'
    ]
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          use: ['css-loader', 'sass-loader'],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'img/[name].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 60
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css')
  ]
};
```

## Developing Webpack Plugin

On our previous section we learn to build a custom webpack plugin to write a JSON manifest of the generated entry files:

```js
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: './src/app.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: __dirname
    }),

    // Our custom plugin.
    function() {
      this.plugin('done', stats => {
        require('fs').writeFileSync(
          path.join(__dirname, 'dist/manifest.json'),
          JSON.stringify(stats.toJson().assetsByChunkName)
        );
      });
    }
  ]
};
```

We can move the entire custom plugin to its own module, so it will be a lot cleaner. Later we can use the plugin like this:

```js
const BuildManifestPlugin = require('./build/plugins/BuildManifestPlugin');
// Omitted...
plugins: [
  new BuildManifestPlugin(path.join(__dirname, 'dist/manifest.json'))
]
```

Now let’s create a plugin for `BuildManifestPlugin`. here’s the basic building of Webpack’s plugin:

```js
// build/plugins/BuildManifestPlugin.js
function BuildManifestPlugin() {
  //
}

BuildManifestPlugin.prototype.apply = function(compiler) {
  //
}

module.exports = BuildManifestPlugin;
```

The `BuildManifestPlugin` accept one parameter, and it’s a location of the manifest file. And we move our code to the `apply` prototype like so:

```js
// build/plugins/BuildManifestPlugin.js
function BuildManifestPlugin(output) {
  this.output = output;
}

BuildManifestPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', stats => {
    require('fs').writeFileSync(
      this.output,
      JSON.stringify(stats.toJson().assetsByChunkName)
    );
  });
}

module.exports = BuildManifestPlugin;
```

Now our Webpack configuration is a lot cleaner this way:

```js
const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const BuildManifestPlugin = require('./build/plugins/BuildManifestPlugin');

module.exports = {
  entry: {
    app: './src/app.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[chunkhash].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], {
      root: __dirname
    }),

    new BuildManifestPlugin(path.join(__dirname, 'dist/manifest.json'))
  ]
};
```

With our current approach, we don’t see the generated manifest file listed on the console. To solve this we need to update our plugin and hook it up to `emit` event rather than `done` like so:

```js
// build/plugins/BuildManifestPlugin.js
const path = require('path');

function BuildManifestPlugin(output) {
  this.output = output;
}

BuildManifestPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', (compiler, callback) => {
    let manifest = JSON.stringify(compiler.getStats().toJson().assetsByChunkName);

    compiler.assets[path.basename(this.output)] = {
      source: function() {
        return manifest;
      },
      size: function() {
        return manifest.length;
      }
    }

    callback();
  });
}

module.exports = BuildManifestPlugin;
```

The `emit` event will pass two parameters: `compiler` and `callback`, we need to call `callback` at the end of our code so webpack now when we’re done. And since the `stats` data is not being passed just like on `done` event, we should get it from the `compiler` object:

```js
compiler.getStats();
```

In order to display our generated manifest on the console, we need to add it to the `composer.assets` array:

```js
compiler.assets[path.basename(this.output)] = {
  source: function() {
	  return manifest;
	},
	size: function() {
	  return manifest.length;
	}
}
```

The `source` is the content of our manifest file and `size` is the file size. If we run this again, we’ll get out manifest file listed on the console like this:

```bash
                      Asset      Size  Chunks             Chunk Names
app.780342ad3ba9525cc839.js   2.54 kB       0  [emitted]  app
              manifest.json  37 bytes          [emitted]
```