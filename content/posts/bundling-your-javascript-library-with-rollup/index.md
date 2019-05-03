---
title: Bundling Your JavaScript Library with Rollup
date: 2018-11-04 02:51:00
tags: [javascript, rollup]
description: A step-by-step tutorial on how to bundle your JavaScript library using Rollup. You'll also learn how to publish those bundles to NPM.
image: ../../img/rollup-logo-og.png
---
Similar to Webpack or Browserify, [Rollup](https://rollupjs.org) is a module bundler for JavaScript. It allows us to use the modern ES module system and transform it into another module system: CommonJS, AMD, or the UMD. It can also bundle our module and wrap it inside the IIFE (Immediately-Invoked Function Expression).

Though people usually use Rollup to bundle a library. It's possible to bundle an application too.

> You can access the source code for this tutorial here: [github.com/risan/eat-fruit](https://github.com/risan/eat-fruit).

## Table of Contents

## Installation

To install Rollup globally, run the following command on your terminal:

```bash
$ npm install -g rollup

# Or if you prefer to use Yarn
$ yarn global add rollup
```

You can now run the following command to print the Rollup CLI help:

```bash
$ rollup -h
```

## Quick Start

To see Rollup in action, let's create a simple ES module:

```js
// main.js
const eat = food => console.log(`I eat ${food}.`);

export default eat;
```

It just a simple function that will print `I eat something` on the console or the terminal. Save the file as `main.js`. On the terminal type the following command to transform our ES module into a CommonJS module:

```bash
$ rollup main.js --file bundle.js --format cjs
```

* `--file`: The path for the output file
* `--format`: The targetted output format, in our case the `cjs` is for the CommonJS module.

Along with the `main.js` file, we should now have the `bundle.js` file. If we open the `bundle.js` file, we'll see that our `eat` function is now using the CommonJS module.

```js
// bundle.js
'use strict';

const eat = food => console.log(`I eat ${food}.`);

module.exports = eat;
```

If you're familiar with Node.js, that's how you usually export a module.

## Exploring Other Output Formats

Rollup offers five output formats for your bundle:

* `cjs`: The CommonJS module that typically targetted for the Node.js environment.
* `amd`: The AMD module which usually used in the browser.
* `umd`: The UMD module which often use to target both the Node.js and the browser environments.
* `es`: The ES module itself.
* `iife`: Which will wrap our bundle within the IIFE (Immediately-Invoked Function Expression) for browser usage.

### AMD Output

Let's bundle our `main.js` module into an AMD module:

```bash
$ rollup main.js --file amd.js --format amd
```

Here's the generated `amd.js` file looks like:

```js
// amd.js
define(function () { 'use strict';

    const eat = food => console.log(`I eat ${food}.`);

    return eat;

});
```

If you ever worked with [RequireJS](https://requirejs.org) or [curl.js](https://github.com/cujojs/curl) in the past. You might notice the `define` function above. It's how you register a factory function in the AMD format.

### UMD Output

Now, let's create the UMD version:

```bash
$ rollup main.js --file umd.js --format umd --name eat
```

For UMD format, we also need to pass the `--name` option. It's the identifier that will be used to expose our module. We use the same name as our `eat` function. We can use a different name though.

If we open up the `umd.js` file, the generated code will look like this:

```js
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.eat = factory());
}(this, (function () { 'use strict';

    const eat = food => console.log(`I eat ${food}.`);

    return eat;

})));
```

It slightly looks more complicated than the previous output formats. It's an IIFE that will check if the current environment supports a CommonJS or an AMD module format. If the current environment supports a CommonJS module, it will export our `eat` function.

```js
typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
```

Or if the current environment supports an AMD module, it will register a factory function for our `eat` module.

```js
typeof define === 'function' && define.amd ? define(factory)
```

Otherwise, it will add the `eat` function into the current `this` object:

```js
global.eat = factory()
```

For example, if we load our `umd.js` file in the browser, we can access our `eat` function from the `window` object:

```js
window.eat('🍕');
```

### ES Output

Rollup can also output the same exact ES module:

```js
rollup main.js --file es.js --format es
```

If we check the generated `es.js` file, we'll find the identical code:

```js
const eat = food => console.log(`I eat ${food}.`);

export default eat;
```

We use this option in case the users of our library want to use a tool that can leverage the ES module, like Webpack  2+.

### IIFE

The last format that we can generate with Rollup is IIFE (Immediately-Invoked Function Expression):

```js
rollup main.js --file iife.js --format iife --name eat
```

Just like the UMD format, we have to set the `--name` option. If we check the `iife.js` file, the `eat` function is wrapped within the IIFE block:

```js
var eat = (function () {
    'use strict';

    const eat = food => console.log(`I eat ${food}.`);

    return eat;

}());
```

## Rollup Configuration File

We can also use a configuration file to configure Rollup. Before continuing, let's delete the generated files. Then move the `main.js` file into the `src` directory.

```bash
# Delete generated files
$ rm bundle.js amd.js umd.js es.js iife.js

# Move main.js to src directory
$ mkdir src
$ mv main.js src
```

Create a new file named `rollup.config.js` and put the following configuration object:

```js
// rollup.config.js
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/cjs.js',
    format: 'cjs'
  }
};
```

Your current directory should now look like this:

```
|-- rollup.config.js
|-- src
|   |-- main.js
```

Run the following command to bundle our main.js file:

```bash
$ rollup -c
```

* `-c`: The config file path. If not set, it will look for the `rollup.config.js` file.

We should now have the generated CommonJS file stored at: `dist/cjs.js`.

### Multiple Output Formats

We can also assign an array to the `output` option to generate various output formats:

```js
// rollup.config.js
export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/umd.js',
      format: 'umd',
      name: 'eat'
    }
  ]
};
```

If you run the `rollup -c` command again, it will generate two bundles with different module format: `cjs` and `umd`.

### Multiple Inputs

It's also possible to build bundles from multiple inputs:

```js
// rollup.config.js
export default [
  {
    input: 'src/main.js',
    output: [
      {
        file: 'dist/cjs.js',
        format: 'cjs'
      },
      {
        file: 'dist/umd.js',
        format: 'umd',
        name: 'eat'
      }
    ]
  },
  {
    input: 'src/other.js',
    output: {
      file: 'dist/other.bundle.js',
      format: 'cjs'
    }
  }
];
```

## Tree-Shaking

One of the most amazing features on Rollup is its tree-shaking ability. RollUp can statically analyze our code and remove unused functions or modules from our bundle.

### Preparing Our Food Factory

Within the `src` directory create a new file named `food.js`:

```js
// src/food.js
const FRUITS = ['🍏', '🍉', '🍇'];

const FAST_FOODS = ['🍔', '🍟', '🍕'];

const randomFruit = () =>
  FRUITS[getRandomNumberBetween(0, FRUITS.length - 1)];

const randomFastFood = () =>
  FAST_FOODS[getRandomNumberBetween(0, FRUITS.length - 1)];

const getRandomNumberBetween = (start, end) =>
  Math.floor(Math.random() * end) + start;

export {
  FRUITS,
  FAST_FOODS,
  randomFruit,
  randomFastFood
};
```

In this `food` module, we export two constants and two functions:

* `FRUITS`: An array of fruit emojis.
* `FAST_FOODS`: An array of fast food emojis.
* `randomFruit`: Function to get a random fruit emoji.
* `randomFastFood`: Function to get a random fast food emoji.

### Tree-Shaking in Action

Let's get back to our `main.js` file. Rename the `eat` function to `eatFruit`. Use the `randomFruit` function from our `food` module to generate a random fruit emoji:

```js
// src/main.js
import * as food from './food';

const eatFruit = () => console.log(`I eat ${food.randomFruit()}.`);

export default eatFruit;
```

Type the following command on the terminal to bundle our `main.js` module into a CommonJS format.

```bash
$ rollup src/main.js --file dist/bundle.js --format cjs
```

Let's inspect the generated `bundle.js` file:

```js
// dist/bundle.js
'use strict';

const FRUITS = ['🍏', '🍉', '🍇'];

const randomFruit = () =>
  FRUITS[getRandomNumberBetween(0, FRUITS.length - 1)];

const getRandomNumberBetween = (start, end) =>
  Math.floor(Math.random() * end) + start;

const eatFruit = () => console.log(`I eat ${randomFruit()}.`);

module.exports = eatFruit;
```

Even though we import the whole `food` module into our code, Rollup is smart enough to strip any unused parts. Both the `FAST_FOODS` constant and the `randomFastFood` function are excluded from the final bundle. Isn't that awesome?

Even though Rollup is smart enough to exclude any unused functions or modules, it's a good practice to explicitly export things that we only need. Let's modify our `main.js` file to import the `randomFruit` function only:

```js
// src/main.js
import { randomFruit } from './food';

const eatFruit = () => console.log(`I eat ${randomFruit()}.`);

export default eatFruit;
```

Run the command to bundle our `main.js` file again, we should have the same exact output.

```bash
$ rollup src/main.js --file dist/bundle.js --format cjs
```

### Three-Shaking Gotcha

Suppose we use the `default` keyword to export the four items in the `food.js` module:

```js
// Omitted for brevity...

export default {
  FRUITS,
  FAST_FOODS,
  randomFruit,
  randomFastFood
};
```

And the `main.js` file looks like this to accommodate that change:

```js
// src/main.js
import food from './food';

const eatFruit = () => console.log(`I eat ${food.randomFruit()}.`);

export default eatFruit;
```

If we bundle that `main.js` file through Rollup, the output will look like this:

```js
// dist/bundle.js
'use strict';

const FRUITS = ['🍏', '🍉', '🍇'];

const FAST_FOODS = ['🍔', '🍟', '🍕'];

const randomFruit = () =>
  FRUITS[getRandomNumberBetween(0, FRUITS.length - 1)];

const randomFastFood = () =>
  FAST_FOODS[getRandomNumberBetween(0, FRUITS.length - 1)];

const getRandomNumberBetween = (start, end) =>
  Math.floor(Math.random() * end) + start;

var food = {
  FRUITS,
  FAST_FOODS,
  randomFruit,
  randomFastFood
};

const eatFruit = () => console.log(`I eat ${food.randomFruit()}.`);

module.exports = eatFruit;
```

Even though we're not using them, we ended up having both `FAST_FOODS` and `randomFastFood` in our bundle file.

There's [another three-shaking gotcha](#another-three-shaking-gotcha) explained on the next section that you should be aware of.

## Importing NPM Package

We often need to pull a third party library from NPM. For our example, let's pull the `lodash` library. Within the project directory, type the following command to create an empty `package.json` file:

```bash
$ echo {} > package.json
```

Then install the `lodash-es` package, it's the ES modules version for `lodash`:

```bash
$ npm install lodash-es

# Or if you prefer to use Yarn
$ yarn add lodash-es
```

Open up the `src/food.js` file. Let's replace the `getRandomNumberBetween` with the lodash's `random` function instead.

```js
// src/food.js
import { random } from 'lodash-es';

const FRUITS = ['🍏', '🍉', '🍇'];

const FAST_FOODS = ['🍔', '🍟', '🍕'];

const randomFruit = () =>
  FRUITS[random(0, FRUITS.length - 1)];

const randomFastFood = () =>
  FAST_FOODS[random(0, FRUITS.length - 1)];

export {
  FRUITS,
  FAST_FOODS,
  randomFruit,
  randomFastFood
};
```

This time we're going to use the Rollup configuration file. On your project directory, create a new file named `rollup.config.js`:

```js
// rollup.config.js
export default {
  input: 'src/main.js',
  output: {
    file: 'dist/cjs.js',
    format: 'cjs'
  }
};
```

With this configuration file, we're going to generate a bundle with CommonJS format. Let's build our `main.js` file!

```bash
$ rollup -c
```

You'll get a warning that it can't resolve the `lodash-es`.

```bash
(!) Unresolved dependencies
https://rollupjs.org/guide/en#warning-treating-module-as-external-dependency
lodash-es (imported by src/food.js)
created dist/cjs.js in 32ms
```

If you check the generated `dist/cjs.js` file, you'll see that the lodash code is not included. It simply `require` the `lodash-es` module.

```js
'use strict';

var lodashEs = require('lodash-es');

const FRUITS = ['🍏', '🍉', '🍇'];

const randomFruit = () =>
  FRUITS[lodashEs.random(0, FRUITS.length - 1)];

const eatFruit = () => console.log(`I eat ${randomFruit()}.`);

module.exports = eatFruit;
```

The bundle will still work if the user of your library happens to have `lodash-es` installed on their project. Of course, it's not a reliable approach to build a library. So how can we solve this?

### Resolving Third Party Modules with Plugin

Luckily, there's already a plugin to assist Rollup resolving any third party modules installed through NPM: [`rollup-plugin-node-resolve`](https://github.com/rollup/rollup-plugin-node-resolve). Let's install this plugin as our dev-dependency:

```bash
$ npm install rollup-plugin-node-resolve -D

# If you prefer to use Yarn
$ yarn add rollup-plugin-node-resolve -D
```

Next, we need to register this plugin within our `rollup.config.js` file:

```js
// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/cjs.js',
    format: 'cjs'
  },
  plugins: [
    resolve()
  ]
};
```

Let's bundle our `main.js` file once again:

```js
$ rollup -c
```

There's no warning message this time! If you check the generated `dist/cjs.js` file, you should find the lodash code in the bundle.

But wait, why is there so many lodash codes in our bundle file? Though we only import the `random` function. 🤔

### Another Three-Shaking Gotcha

Performing static analysis in a dynamic programming language like JavaScript is hard. Rollup has to be careful in removing any unused code to guarantee that the final bundle still works correctly.

If an imported module appears to have some side-effects, Rollup needs to be conservative and includes those side-effects. Even though it may be a false positive, just like in our lodash case above.

In our lodash case, we can get around this by importing the submodule instead:

```js
// src/food.js
import random from 'lodash-es/random';

const FRUITS = ['🍏', '🍉', '🍇'];

const FAST_FOODS = ['🍔', '🍟', '🍕'];

const randomFruit = () =>
  FRUITS[random(0, FRUITS.length - 1)];

const randomFastFood = () =>
  FAST_FOODS[random(0, FRUITS.length - 1)];

export {
  FRUITS,
  FAST_FOODS,
  randomFruit,
  randomFastFood
};
```

### Importing CommonJS Module

The `lodash-es` package is using the ES module format. So Rollup can process it out of the box. Unfortunately, the majority of packages published on NPM are using the CommonJS format.

Let's replace the `lodash-es` package with its CommonJS counterpart: `lodash` and see if Rollup can handle it.

```bash
$ npm uninstall lodash-es
$ npm i lodash

# If you use Yarn
$ yarn remove lodash-es
$ yarn add lodash
```

Don't forget to update the import statement on the `food.js` module:

```js
// src/food.js
import random from 'lodash/random';

const FRUITS = ['🍏', '🍉', '🍇'];

const FAST_FOODS = ['🍔', '🍟', '🍕'];

const randomFruit = () =>
  FRUITS[random(0, FRUITS.length - 1)];

const randomFastFood = () =>
  FAST_FOODS[random(0, FRUITS.length - 1)];

export {
  FRUITS,
  FAST_FOODS,
  randomFruit,
  randomFastFood
};
```

Let's run the Rollup command to bundle our `main.js` file:

```bash
$ rollup -c
```

We'll end up having an error message like this:

```bash
src/main.js → dist2/cjs.js...
[!] Error: 'default' is not exported by node_modules/lodash/random.js
https://rollupjs.org/guide/en#error-name-is-not-exported-by-module-
src/food.js (1:7)
1: import random from 'lodash/random';
```

It turns out Rollup can't process the CommonJS format. Fortunately, there's already a plugin to solve this issue: [rollup-plugin-commonjs](https://github.com/rollup/rollup-plugin-commonjs). This plugin will convert any CommonJS modules into the ES module format. That way Rollup can process them.

Let's install this plugin:

```bash
$ npm install rollup-plugin-commonjs -D

# Or if you use yarn
$ yarn add rollup-plugin-commonjs -D
```

Don't forget to register it on `rollup.config.js` file:

```js
// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/cjs.js',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
```

Try to bundle our `main.js` file again. There should be no error this time.

```bash
$ rollup - c
```

> If you register other plugins that can also transform your module, make sure that the `rollup-plugin-commonjs` comes before any of that plugins. It's to prevent the other plugins from making changes that may break the CommonJS detection.

### Peer Dependencies

Suppose that we decided to list `lodash` as our library's peer dependencies. So instead of bundling `lodash/random` into our bundle, we'd ask the user to install `lodash` package separately.

We can achieve this by providing the `external` property to the `rollup.config.js` file:

```js
// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/cjs.js',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    commonjs()
  ],
  external: [
    'lodash/random'
  ]
};
```

The module listed on the `external` option must match exactly the same as how we imported it in our code. That's why we use `lodash/random` instead of just `lodash`.

Let's try to bundle our `main.js` file again:

```bash
$ rollup -c
```

If we peek at the generated `dist/cjs.file`, the lodash code is now excluded from our bundle:

```js
// dist/cjs.js
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var random = _interopDefault(require('lodash/random'));

const FRUITS = ['🍏', '🍉', '🍇'];

const randomFruit = () =>
  FRUITS[random(0, FRUITS.length - 1)];

const eatFruit = () => console.log(`I eat ${randomFruit()}.`);

module.exports = eatFruit;
```

If we choose to generate the `umd` or `iife` format, we have to specify the `global` option too. This option tells Rollup on how to access that peer dependency.

```js
// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/umd.js',
      format: 'umd',
      name: 'eatFruit',
      globals: {
        'lodash/random': '_.random'
      }
    },
    {
      file: 'dist/iife.js',
      format: 'iife',
      name: 'eatFruit',
      globals: {
        'lodash/random': '_.random'
      }
    }
  ],
  plugins: [
    resolve(),
    commonjs()
  ],
  external: [
    'lodash/random'
  ]
};
```

If we load lodash package in the browser, we can access it through the `_` identifier.

> ⚠️ **WARNING**
>
> If you list a package as a peer-dependency for your library, set the required version as loose as possible. At least don't target the exact patch version. This is to avoid version incompatibility with other libraries.

Before continuing to the next section, let's revert our change by removing `lodash/random` module as the peer dependency. Simply remove the `external` option from `rollup.config.js` file:

```js
// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/cjs.js',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    commonjs()
  ]
};
```

## Compiling ES 2015+ Code with Babel

You can use Babel with Rollup to transform your ES 2015+ code into a backward compatible version of JavaScript. This way your library can also be used in some older browsers or Node versions.

First, let's install `@babel/core`, `@babel/preset-env`, and `rollup-plugin-babel`:

```bash
$ npm install @babel/core @babel/preset-env rollup-plugin-babel -D

# If you use Yarn
$ yarn add @babel/core @babel/preset-env rollup-plugin-babel -D
```

With `@babel/preset-env`, we can easily target the minimum environments and don't need to choose the Babel's plugins manually. The `rollup-plugin-babel` is the required plugin for Babel integration with Rollup.

Next, let's create a `.babelrc` config file. Store it within the `src` directory instead of the project root directory. This way we can have different babel configuration for other parts, like tests.

```json
{
  "presets": [
    [
      "@babel/env",
      {
        "modules": false,
        "useBuiltIns": "usage",
        "targets": {
          "node": "4"
        }
      }
    ]
  ]
}
```

We set the `modules` to `false` to prevent Babel from transforming any ES modules. Rollup already handles this for us. We also set the `useBuiltIns` to `usage` to import polyfills for the features that we only use.

We also set the minimum Node version to `4`. If we don't set the `targets` option, it will work exactly the same as using `@babel/preset-es2015`, `@babel/preset-es2016`, and `@babel/preset-es2017` together.

> This year, Node version 4 is already in the end-of-life. We targetted this version just to see the transformation made by Babel.

Lastly, we need to register the `rollup-plugin-babel` plugin within the `rollup.config.js` file:

```js
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/cjs.js',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
```

Note that we also pass the `exclude` option to exclude any codes from the `node_modules` directory from transformation. Let's bundle our `main.js` file:

```bash
$ rollup -c
```

If you check the generated `dist/cjs.js` file, you'll find that our ES 2015 code is transformed into the ES5 standard:

```js
// Omitted for brevity...

var FRUITS = ['🍏', '🍉', '🍇'];

var randomFruit = function randomFruit() {
  return FRUITS[random_1(0, FRUITS.length - 1)];
};

var eatFruit = function eatFruit() {
  return console.log(`I eat ${randomFruit()}.`);
};
```

### Using Browserlist

We can also use a [browserslist](https://github.com/browserslist/browserslist) query for targetting the minimum environments. Let's update our `src/.babelrc` file to target only Node versions that are still maintained:

```js
{
  "presets": [
    [
      "@babel/env",
      {
        "modules": false,
        "targets": "maintained node versions"
      }
    ]
  ]
}
```

Check all of the possible browserslist queries here: [Full List](https://github.com/browserslist/browserslist#full-list).

Now run the Rollup command to bundle our `main.js` file:

```bash
$ rollup -c
```

If we check our code in the generated bundle file, it should now back to the ES 2015 syntax again:

```js
// Omitted for brevity...

const FRUITS = ['🍏', '🍉', '🍇'];

const randomFruit = () => FRUITS[random_1(0, FRUITS.length - 1)];

const eatFruit = () => console.log(`I eat ${randomFruit()}.`);
```

It's also possible for us to use the `.browserslist` configuration file. First, let's remove the `targets` option from the `src/.babelrc` file:

```js
{
  "presets": [
    [
      "@babel/env",
      {
        "modules": false
      }
    ]
  ]
}
```

Next, create a new `.browserslistrc` file in the project root directory:

```
maintained node versions
```

We will get a similar output if we run the Rollup command again.

### Different Output Format, Different Minimum Environments

Suppose that we want to generate a `umd` format. So it can be used in a browser too. Let's update our `rollup.config.js` file:

```js
// rollup.config.js
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/umd.js',
      format: 'umd',
      name: 'eatFruit'
    }
  ],
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
```

Let's update our `.browserslistrc` file too:

```
maintained node versions
last 1 version
> 5%
not dead
```

The above query means that we want to support:
* `maintained node versions`: All Node versions that are still maintained.
* `last 1 version`: The last 1 version of each browser.
* `> 5%`: All browsers with more than 5% usage statistic.
* `not dead`: And only include the browsers that still have official support or updates.

Run the Rollup command again:

```bash
$ rollup -c
```

Check the generated bundles. Both the `cjs` and the `umd` format are using ES5 syntax. That's because of our query on `.browerslistrc` are applied both to the `cjs` and `umd` output. Some of the browsers from that query are still not supporting `const` and arrow function syntax that we use. You can check all of the browsers that matched our query on this website: [browserl.ist](https://browserl.ist/?q=last+1+version%2C%3E+5%25%2C+not+dead).

So how can we use a different `browserslist` query for `cjs` and `umd` format? For the CommonJS format we want to use:

```
maintained node versions
```

While for the UMD format, we'd like to use:
```
last 1 version
> 5%
not dead
```

Remember that we're allowed to have [multiple inputs](#multiple-inputs) in `rollup.config.js`:

```js
// rollup.config.js
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/cjs.js',
      format: 'cjs'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              modules: false,
              useBuiltIns: "usage",
              targets: 'maintained node versions'
            }
          ]
        ]
      })
    ]
  },
  {
    input: 'src/main.js',
    output: {
      file: 'dist/umd.js',
      format: 'umd',
      name: 'eatFruit'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  }
];
```

Note that on the `cjs` section, we pass `babelrc: false` to the babel plugin. This way we can override the configurations that are set on the `src/.babelrc` file.

```js
babel({
  exclude: 'node_modules/**',
  babelrc: false,
  presets: [
    [
      '@babel/env',
      {
        modules: false,
        useBuiltIns: "usage",
        targets: 'maintained node versions'
      }
    ]
  ]
})
```

Don't forget to update the `.browerslistrc` too:

```
last 1 version
> 5%
not dead
```

The `umd` format will still use the query set on the `.browerslistrc`. But the `cjs` format will now use the `maintained node versions` query instead. Run the bundle command again:

```bash
$ rollup -c
```

You should now find that the `umd` format are using ES 2015 syntax again.

## Minifying Bundle

For browser usage, the library author often offers a minified version of the library. We can use the [`rollup-plugin-terser`](https://github.com/TrySound/rollup-plugin-terser) to minify our `umd` bundle. Let's install it:

```bash
$ npm i rollup-plugin-terser -D

# Or if you use Yarn
$ yarn add rollup-plugin-terser -D
```

We'll keep the non-minified version of the `umd` bundle. So we just need to add a similar `umd` config but with the `rollup-plugin-terser` addition.

```js
// rollup.config.js
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/cjs.js',
      format: 'cjs'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              modules: false,
              useBuiltIns: "usage",
              targets: 'maintained node versions'
            }
          ]
        ]
      })
    ]
  },
  {
    input: 'src/main.js',
    output: {
      file: 'dist/umd.js',
      format: 'umd',
      name: 'eatFruit'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  },
  {
    input: 'src/main.js',
    output: {
      file: 'dist/umd.min.js',
      format: 'umd',
      name: 'eatFruit'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      }),
      terser()
    ]
  }
];
```

Once it's added, let's bundle our `main.js` file again:

```bash
$ rollup -c
```

We should now get a new bundle named `umd.min.js`. If you check this bundle, you'll see that the code is minified.

## Publishing Our Bundles

Let's wrap this up by publishing our bundles to NPM. First, let's install `rollup` as our dev dependency:

```bash
npm i rollup -D

# Or if you use Yarn.
yarn add rollup -D
```

All this time we use the globally installed `rollup` to bundle our library. It's not the right approach. Other people might contribute to our library. It's possible that they have different Rollup version, or even worse they might not have Rollup installed at all.

We might also use a CI pipeline to automate package publishing. And the server might not have Rollup installed. This way we can make sure every contributor or the CI server use the same version of Rollup.

### Update Our package.json File

Let's update our `package.json` file too:

```json
{
  "name": "eat-fruit",
  "description": "Package to print some random fruit I eat.",
  "version": "0.0.1",
  "license": "MIT",
  "main": "dist/eat-fruit.cjs.js",
  "browser": "dist/eat-fruit.umd.js",
  "module": "dist/eat-fruit.es.js",
  "engines": {
    "node": ">= 6"
  },
  "scripts": {
    "build": "rollup -c",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "lodash": "^4.17.11"
  },
  "devDependencies": {
    "@babel/core": "^7.1.2",
    "@babel/preset-env": "^7.1.0",
    "rollup": "^0.66.6",
    "rollup-plugin-babel": "^4.0.3",
    "rollup-plugin-commonjs": "^9.2.0",
    "rollup-plugin-node-resolve": "^3.4.0",
    "rollup-plugin-terser": "^3.0.0"
  }
}
```

> 🚨 IMPORTANT
>
> The `name` property in the `package.json` is the most important one. It's the name of your package. **It must be unique**. I already used the `eat-fruit` name. You have to choose your own unique package name. Use the [NPM](https://www.npmjs.com) search feature to check for the availability.
>
> Read more about the `name` rules in the [documentation](https://docs.npmjs.com/files/package.json#name).

Note that our dependencies' version might be different, and that's okay. Also notice the `main`, `module`, and `browser` properties:

```json
{
  ...
  "main": "dist/eat-fruit.cjs.js",
  "browser": "dist/eat-fruit.umd.js",
  "module": "dist/eat-fruit.es.js",
  ...
}
```

* `main`: This is the primary entry point for our package. We set it to the CommonJS bundle format.
* `browser`: This is the bundle for the browser usage.
* `module`: This is the ES bundle that meant to be used by the ES-module-aware tools like Rollup or Webpack 2+.

We also add some `scripts`:

```json
{
  ...
  "scripts": {
    "build": "rollup -c",
    "prepublishOnly": "npm run build"
  },
  ...
}
```

* `build`: Run the Rollup bundle command.
* `prepublishOnly`: This script will be run before our library is published. It's to make sure that we publish the latest bundles.

### Updating the Rollup Config File

Let's update our Rollup config file to generate the `es` module too. We also use the `package.json` file to specify the output path for each format.

```js
// rollup.config.js
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

export default [
  {
    input: 'src/main.js',
    output: {
      file: pkg.main,
      format: 'cjs'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**',
        babelrc: false,
        presets: [
          [
            '@babel/env',
            {
              modules: false,
              useBuiltIns: "usage",
              targets: 'maintained node versions'
            }
          ]
        ]
      })
    ]
  },
  {
    input: 'src/main.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'eatFruit'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  },
  {
    input: 'src/main.js',
    output: {
      file: pkg.browser.replace(/\.js$/, '.min.js'),
      format: 'umd',
      name: 'eatFruit'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      }),
      terser()
    ]
  },
  {
    input: 'src/main.js',
    output: {
      file: pkg.module,
      format: 'es'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: 'node_modules/**'
      })
    ]
  }
];
```

Let's try to bundle our library:

```bash
$ npm run build

# Or if you use Yarn
$ yarn build
```

We should now have four build files within the `dist` directory:

* `eat-fruit.cjs.js`
* `eat-fruit.ed.js`
* `eat-fruit.umd.js`
* `eat-fruit.umd.min.js`

### Add .npmignore File

We only want to distribute the generated bundle files. We don't need to include the `src` directory or the Rollup configuration file. We can create `.npmignore` file to exclude files or directories that we don't want to distribute to our users.

```bash
#.npmignore
.browserslistrc
rollup.config.js
src
yarn.lock
```

Note that the `node_modules` directory will be ignored automatically, so we don't have to add it into the `.npmignore`. Note that the `package.json`, `README`, `LICENSE`, and `CHANGELOG` files will always be included. Even if we list them in the `.npmignore`.

### Login To NPM

To publish a package, you must be registered as an [NPM](https://www.npmjs.com) user. If you're not a user create a new account here: [NPM Sign Up](https://www.npmjs.com/signup).

Next, login to NPM using your terminal:

```bash
$ npm login
```

Type the following command to check whether you're logged in or not:

```bash
$ npm whoami
```

### Publishing

Before publishing your package, make sure that your bundle can be installed and working properly. You can install your package locally. Create a directory somewhere outside of your project directory.

Now, within that test directory, create an empty `package.json` file:

```bash
$ echo {} > package.json
```

You can then install your package by passing the path to your package project directory:

```bash
$ npm i ../path/to/package-directory

# Or if you use Yarn
$ yarn add ../path/to/package-directory
```

You can verify further by opening the node-repl and try to require your package:

```bash
$ node

> const eatFruit = require('eat-fruit');
undefined
> eatFruit();
I eat 🍉.
```

If all goes well, you're ready to publish your package! Run the following command to:

```bash
$ npm publish
```

## Summary

Congratulation 🎉 You've made it until the end! Let's recap what you've learned so far:

* Rollup offers various output formats:  `amd`, `cjs`, `es`, `umd`, and `iife`.
* We can configure Rollup through a configuration file.
* Rollup has a tree-shaking feature that can eliminate unused code from the final bundle.
* Many plugins available to extend Rollup capability, we tried several of them: resolving external NPM package, transforming CommonJS module, integration with Babel, and plugin for minifying the bundle.
* We also learn how to publish our package to NPM registry.

You can get the source code for this tutorial on my Github repository: [github.com/risan/eat-fruit](https://github.com/risan/eat-fruit). And don't forget to check out the official [Rollup guide](https://rollupjs.org/guide/en).
