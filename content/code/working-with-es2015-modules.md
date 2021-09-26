---
title: Working with ES2015 Modules
description: >
    Practical guide to work with ES2015 modules system. Learn how to export and import modules with
    ES2015 standard. How to bundle-up and transpile your ES2015 modules with Rollup and Webpack.
date: 2017-02-26T09:13:00+02:00
categories: [tutorial]
tags: [javascript]
images: [/img/javascript.png]
---
ES2015 has its own module system. To create a module simply use the `export` keyword. For example, we have a `TaskCollection` module stored on `TaskCollection.js` file like this:

```js
// TaskCollection.js
export class TaskCollection {
  constructor(tasks = []) {
    this.tasks = tasks;
  }

  print() {
    this.tasks.forEach(task => console.log(task));
  }
}
```

If we want to use this `TaskCollection` module from another file, we can import it using the `import` keyword like this:

```js
import { TaskCollection } from './TaskCollection';

let myTasks = new TaskCollection([
  'Learn Javascript',
  'Least ES 2015 Modules'
]);
```

{{<toc>}}

## Exporting Multiple Modules within One File

The ES2015 modules allow us to export multiple modules within one file:

```js
// Shape.js
export class Square {
  constructor(length) {
    this.length = length;
  }
}

export function getShapeList() {
  return ['Square', 'Circle'];
}

export const PI = 3.14;
```

And now to import those modules, we can do it like this:

```
import { Square, PI } from './TaskCollection';
```

Although we are allowed to export multiple modules on one file, it’s best that we only export one module per-file to keep it simple.

## Exporting Module at The End of File

If you don’t like the `export` syntax in front of the statement, you can put it at the end of file:

```js
class TaskCollection {
  constructor(tasks = []) {
    this.tasks = tasks;
  }
}

export TaskCollection;
```

## Default Export

We can use `default` keyword to export a default module. It’s make sense to always use `default` export if it’s the only module on the file.

```js
export default class TaskCollection {
  constructor(tasks = []) {
    this.tasks = tasks;
  }
}
```

And to import a default module we no longer need object destructuring syntax.

```js
import TaskCollection from './TaskCollection';
```

If there’s another non-default modules we would like to import it, we can do it like this:

```js
// TaskCollection.js
export default class TaskCollection {
  constructor(tasks = []) {
    this.tasks = tasks;
  }
}

export const foo = 'bar';

// To import it.
import TaskCollection, { foo } from './TaskCollection';
```

## Rollup JS

ES 2015 module is great, but currently it’s not supported on most browser, we still need a javascript module bundler, one of them is [Rollup.js](http://rollupjs.org/)

### Installing Rollup

Install rollup locally within your project directory:

```bash
$ yarn add rollup -D 
```

We can access Rollup executable file at: `./node_modules/.bin/rollup`.

### Bundling The Module

If we want to bundle up our javascript file that importing various modules, simply run the following command:

```bash
$ ./node_modules/.bin/rollup ./src/main.js -o ./dist/main.js -f=es
```

- The first argument is the entry file, it’s the file that we’re going to bundle up.
- `-o` option to specify the output file
- `-f` is an optional argument to specify the output format, in this case we are using `es` (the ES2015 format).

Note that with three-shaking feature, Rollup will smartly select and bundle up the required modules only.

### Rollup Configuration File

We can also create a configuration file for Rollup, so we don’t  have to specify a command line options every time we’re bundling up the file. Create a file named `rollup.config.js`:

```js
export default {
  entry: './src/main.js',
  format: 'es',
  dest: './dist/main.js'
};
```

And now to bundle up the file using the defined configuration, use the following command:

```bash
$ ./node_modules/.bin/rollup -c
```

Next, we can add a `scripts` option within the `package.json`. So we can easily bundle up this js file with npm command: `npm run build`.

```json
{
  "scripts": {
    "build": "rollup -c"
  },
}
```

### Transpiling ES2015 Code with Rollup Buble Plugin

Note that Rollup will only bundle up the modules, but not converting the ES2015 code to the old ES5 standard. In order to transpile the ES2015 code, we need a Rollup plugin named Buble.

Install the `rollup-plugin-buble` plugin:

```bash
$ yarn add rollup-plugin-buble -D
```

Then update the `rollup.config.js` to register the `buble` plugin:

```js
import buble from 'rollup-plugin-buble';

export default {
  entry: './src/main.js',
  format: 'es',
  dest: './dist/main.js',
  plugins: [buble()],
};
```

Now whenever we run `rollup -c` command to bundle up the modules, the output file will also be transpiled.

### Transpiling ES2015 Code with Rollup Babel Plugin

If you still want to use Babel for transpiling the ES2015 code, there’s also a Rollup plugin for Babel. Simply install the plugin and the required Babel preset with the following command:

```bash
$ yarn add rollup-plugin-babel -D
$ yarn add babel-preset-es2015 -D
$ yarn add babel-plugin-external-helpers -D
```

Next create the `.babelrc` file:

```json
{
  "presets": [
    [
      "es2015", { "modules": false }
    ]
  ],
  "plugins": [
    "external-helpers"
  ]
}
```

And finally update the `plugins` option with `babel()` instead:

```js
import babel from 'rollup-plugin-babel';

export default {
  entry: './src/main.js',
  format: 'es',
  dest: './dist/main.js',
  plugins: [babel()],
};
```

## Webpack

Rollup is fast and the output file is pretty clean. But there’s also Webpack with tons of features and big community.

### Install Webpack

To install webpack locally, run the following command:

```bash
$ yarn add webpack -D
```

We can access the executable file at: `./node_modules/.bin/webpack`.

### Bundling The Module

To bundle up the javascript file with Webpack, run the following command:

```bash
$ ./node_modules/.bin/webpack ./src/main.js ./dist/main.js
```

- The first argument is the entry file
- The second argument is the output file where the bundled up modules will be generated

### Webpack Configuration File

We can also define the bundle options within the configuration file named `webpack.config.js`:

```js
module.exports = {
  entry: './src/main.js',
  output: {
    filename: './dist/main.js'
  }
};
```

Now to bundle up the file with configuration file we can simply run:

```bash
$ ./node_modules/.bin/webpack
```

Or we can also specify the configuration filename like so:

```bash
$ ./node_modules/.bin/webpack --config webpack.config.js
```

We can add a `scripts` option within our `package.json` file for running the Webpack:

```json
{
  "scripts": {
    "build": "webpack"
  },
}
```

Now we can use the `npm run build` command instead.

### Transpiling ES2015 Code with Webpack Buble Loader

Similar with Rollup, the Webpack will not automatically transform the ES2015 code to the old ES5 standard. In order to do so, we can use Buble loader for Webpack.

First, install the Buble and its Buble loader for Webpack:

```bash
$ yarn add buble -D
$ yarn add buble-loader -D
```

Next update our `webpack.config.js` file to include the Buble loader.

```js
module.exports = {
  entry: './src/main.js',
  output: {
    filename: './dist/main.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
		  exclude: 'node_modules',
        loader: 'buble-loader'
      }
    ]
  }
};
```

The loader term in Webpack is pretty similar with task in Gulp. Note that the `test` option is assigned with a regular expression which simply just look for the file with `.js` extension.

### Transpiling ES2015 Code with Webpack Babel Loader

We can also use Babel loader instead of Buble to transpile the ES2015 code.

First install the required dependencies:

```bash
$ yarn add babel-core -D
$ yarn add babel-preset-es2015 -D
$ yarn add babel-loader -D
```

Next update our `webpack.config.js` file to use the Babel loader:

```js
module.exports = {
  entry: './src/main.js',
  devtool: "cheap-module-eval-source-map",
  output: {
    filename: './dist/main.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: 'node_modules',
        loader: 'babel-loader'
      }
    ]
  }
};
```

### Generating Source Map

We can generate a source map to make a debugging process easier, simply add `devtool` option within our `webpack.config.js` file:

```js
module.exports = {
  entry: './src/main.js',
  devtool: "cheap-module-eval-source-map",
  output: {
    filename: './dist/main.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'buble-loader',
      }
    ]
  }
};
```

You can check various `devtool` values here: [Devtool](https://webpack.js.org/configuration/devtool/#devtool)
