---
title: Regenerator Runtime is not defined
date: 2018-11-11T11:05:00+02:00
categories: [log]
tags: [javascript]
images: [/img/babel.png]
---
I was tinkering with my antiquated, silly, and super tiny NPM module this morning: [giphy-random](https://github.com/risan/giphy-random). It basically for retrieving a random GIF using the Gihpy API.

I simplified the code, from the class-based to just a simple function. I also replaced the `Promise` syntax with the `async-await` style. It's super simple:

```js
import axios from "axios";

const giphyRandom = async (apiKey, { tag, rating = "g" } = {}) => {
  const params = { api_key: apiKey, rating };

  if (tag) {
    params.tag = tag;
  }

  const { data } = await axios.get("https://api.giphy.com/v1/gifs/random", {
    params
  });

  return data;
};

export default giphyRandom;
```

Then I went ahead and upgraded the babel package to the latest version 7. Using Babel 7 means I no longer need to use the [`babel-plugin-external-helpers`](https://www.npmjs.com/package/babel-plugin-external-helpers). This plugin was used to prevent Babel from injecting the same helper functions on each file its transformed.

My `.babelrc` looks simpler without any additional plugins:

```json
{
  "presets": [
    ["@babel/env", {
      "modules": false
    }]
  ]
}
```

The `modules` is set to `false` because I use [rollup](https://rollupjs.org/) to bundle my library—which can handle the ES module.

## The Error

When I build this tiny library, an error arises from the UMD build:

```js
giphy-random.umd.js:59 Uncaught ReferenceError: regeneratorRuntime is not defined
    at giphy-random.umd.js:59
    at giphy-random.umd.js:104
    at giphy-random.umd.js:4
    at giphy-random.umd.js:5
```

If you've been working with Babel, you might've already known the culprit. This error usually shows up when you use the `generator` or `async` function in your code.

## The Culprit

When you support some older browsers that can't handle the `generator` or `async` syntax. Babel will transform your `generator`/`async` code into a backward-compatible ES5 syntax.

Here's my `.browserslistrc` file. And apparently, some browsers in [that query](https://browserl.ist/?q=last+1+version%2C+%3E%3D+5%25%2C+not+dead) still does not support `async` function 😅.

```
last 1 version
>= 5%
not dead
```

Here's the snippet of generated UMD build from my `giphy-random` library:

```js
var giphyRandom =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(apiKey) {
    // Omitted...

    return regeneratorRuntime.wrap(function _callee$(_context) {
      // Omitted...
    }, _callee, this);
  }));

  return function giphyRandom(_x) {
    return _ref.apply(this, arguments);
  };
}();
```

## The Solutions

As you can see the `async giphyRandom` function is transformed. And the error is thrown because it can't find the reference to the `regeneratorRuntime`. There are two possible solutions here:

1. Let the user provides this `regeneratorRuntime` module itself.
2. Include this `regeneratorRuntime` module in our bundle.

The first approach is just too much of a hassle for the user. So let's include this `regeneratorRuntime` module in our bundle. (Or you can just drop the support for older browsers 😉)

There are also three ways of including this `regeneratorRuntime` module in your bundle:

1. Import the module explicitly: [`regenerator-runtime`](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime).
2. Use the Babel plugin: [`@babel/plugin-transform-runtime`](https://babeljs.io/docs/en/babel-plugin-transform-runtime).
3. Or if you use [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env#usebuiltins), you can simply set the `useBuiltIns` option to `usage`.

The first solution is not scalable. Imagine that in the future all the browsers in our `.browserslistrc` file finally support this `async` function. But because we explicitly import the `regenerator-runtime`, this module will always be included in our final bundle.

With the second and the third approach, the `regeneratorRuntime` module will only be injected if the targetted environment does not support a `generator` or `async` function.

To execute the second solution, first install the plugin:

```bash
$ npm install @babel/plugin-transform-runtime -D

# If you use Yarn
$ yarn add @babel/plugin-transform-runtime -D
```

Next, register this plugin on your `.babelrc` file:

```json
{
  "presets": [
    ["@babel/env", {
      "modules": false
    }]
  ],
  "plugins": ["@babel/plugin-transform-runtime"]
}
```
Finally, update the babel plugin parameter on your Rollup configuration file. Set the `runtimeHelpers` argument to `true`.

Here's the snippet of `giphy-random`'s Rollup configuration for the UMD build format:

```js
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

import pkg from "./package.json";

export default [
  {
    input: "src/index.js",
    output: {
      file: pkg.browser,
      format: "umd",
      name: "giphyRandom",
      globals: {
        axios: "axios"
      }
    },
    external: ["axios"],
    plugins: [
      resolve(),
      commonjs(),
      babel({
        exclude: "node_modules/**",
        runtimeHelpers: true
      })
    ]
  }
];
```

The third solution is a lot more simpler. All we have to do is set the `useBuiltIns` option to `usage` on our `.babelrc` file:

```json
{
  "presets": [
    ["@babel/env", {
      "modules": false,
      "useBuiltIns": "usage"
    }]
  ]
}
```

Babel will automatically import the polyfills for the features that we only use. The polyfill itself is provided by the [core-js](https://github.com/zloirock/core-js).

Now everything should be working fine 👌🏻
