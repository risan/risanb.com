---
title: "Vue Tutorial: Building Real Apps"
description: >
    Go beyond the basics of Vue.js. Make Ajax requests with axios, set up a project with Webpack and vue-cli,
    build an object oriented form, share state, create a custom input, use vue-loader and set up Vue Router.
date: 2017-03-19T10:00:00+02:00
categories: [tutorial]
tags: [javascript, vue, webpack]
images: [/img/vue.png]
---
This is the second part of the Vue tutorial. In the [first part](/posts/vue-tutorial-the-basics/) we learned the basics of Vue.js. Now it's time to build something closer to a real application: fetching data from a server, using a build tool, working with forms and routing between pages. The code is still written for Vue 2 and the tooling of that time (Webpack 2 and vue-cli).

{{<toc>}}

## Vue Ajax Request with Axios

We're going to create a Vue component named `Tasks` that will fetch the tasks data in JSON format from the server and display it within a `ul`. Suppose the server will return a JSON response like this:

```json
{
  "status": "success",
  "data": [
    "Learn ES 2015",
    "Learn Vue.js",
    "Learn Axios"
  ]
}
```

We can register our simple `Tasks` component like this to fetch and display that data:

```js
Vue.component('Tasks', {
  template: `
    <ul>
      <li v-for="task in tasks" v-text="task"></li>
    </ul>
  `,
  data() {
    return { tasks: [] };
  },
  created() {
    axios.get('api/tasks')
      .then(response => this.tasks = response.data.data);
  }
});
```

Note that within the component's `created` event, we make an Ajax request using axios's `get()` method, which returns a promise object. And when it's resolved, we assign the `response.data.data` property to the `tasks` data. The axios's response object has the following structure:

```js
{
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {}
}
```

The server's response will be stored within the `data` property. That's why we need two subsequent `data`s to access the task list.

## Webpack and Vue CLI

This time we're going to set up a Vue project along with the Webpack module bundler. Vue has a CLI tool for scaffolding a Vue project named [vue-cli](https://github.com/vuejs/vue-cli). First we need to install it globally:

```bash
npm install -g vue-cli
```

Once it's installed we can generate a simple Vue and Webpack project with the following command:

```bash
vue init webpack-simple vue-webpack.dev
```

The vue-cli will ask you a few questions regarding the project, we can leave them at the default values for this example. Once it's finished it will create a new `vue-webpack.dev` directory for you. Now `cd` into this directory and install all the required NPM packages:

```bash
cd vue-webpack.dev
yarn
```

We have everything we need to start working on a project. The vue-cli already provides a comprehensive Webpack configuration named `webpack.config.js`. We also have a nice NPM script shortcut to start up `webpack-dev-server`, simply run:

```bash
npm run dev
```

It will start the web server, open up our project in the browser and even provide a hot reload feature.

### Creating Message Component

Using our newly created Vue-Webpack project, we're going to create a simple custom component named `Message`. Create a new file named `Message.vue` and store it within `src/components`.

```html
<template>
  <div class="message">
    <slot></slot>
  </div>
</template>

<script>
export default {
  //
}
</script>

<style>
.message {
  background-color: #fafafa;
  border: 1px solid #eee;
  padding: 10px;
}
</style>
```

The `<template>` tag is used to define a component's template, pretty much like the `template` option we used earlier. The `<script>` tag is where we define our component's logic and export it. And finally the `<style>` tag is where we style our component.

Now to use our `Message` component within our project, update the `src/App.vue` file:

```html
<template>
  <div id="app">
    <message>{{ msg }}</message>
  </div>
</template>

<script>
import Message from './components/Message.vue';

export default {
  name: 'app',
  components: { Message },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
}
</style>
```

Note that even though we import the `Message` component, we are still required to list it within the `components` option. This is because we did not register our `Message` component globally.

### Webpack Hot Module Replacement

As mentioned previously, `npm run dev` will run a `webpack-dev-server` for us. Let's dig into the `package.json` to see the detail:

```json
"scripts": {
  "dev": "cross-env NODE_ENV=development webpack-dev-server --open --hot",
  "build": "cross-env NODE_ENV=production webpack --progress --hide-modules"
},
```

Notice that it will set the `NODE_ENV` environment variable to `development` and run the `webpack-dev-server` with the following options:

* `--open`: Open the project in the browser.
* `--hot`: Use hot module replacement (HMR).

Hot module replacement, or HMR for short, is an awesome tool that allows us to edit our files and see the changes reflected instantly in the browser, without even reloading it manually. Even more, the HMR will keep track of the current component's data state after the updates occur. To see this in action we'll create a `Counter` component and store it within the `src/components` directory:

```html
<template>
  <div>
    <h1>The counter value is: {{ counter }}</h1>
    <button @click="counter += 1">Increase Counter</button>
  </div>
</template>

<script>
  export default {
    data() {
      return { counter: 0 };
    }
  }
</script>
```

Now update our `App.vue` file to use the `Counter` component:

```html
<template>
  <div id="app">
    <counter></counter>
  </div>
</template>

<script>
import Counter from './components/Counter.vue';

export default {
  name: 'app',
  components: { Counter }
}
</script>
```

Open up your console and run:

```bash
npm run dev
```

You'll see that at first your `counter` value will be `0`. Now increase it several times using the button. Then update something within your `App.vue` or `Counter.vue` component, it can be the text or the incremental value. Notice that the changes you've made will be reflected almost instantly in the browser. Even cooler, our `counter` value is kept as it was right before we made any changes.

## Vue Object Oriented Form

In this section we're going to build a task form and a task list on top of an API. The API is a Laravel backend, and we are going to wrap the form logic into a couple of classes.

### Error Class

The `Error` class will be responsible for collecting errors from the API. By default, the Laravel validation will return a JSON error response in the following format:

```json
{
  "title": [
    "title error messaage 1",
    "title error message 2",
    ...
  ],
  "description": [
    "description error messaage 1",
    "description error message 2",
    ...
  ]
}
```

```js
// core/Error.js

export default class Error {
  constructor(messageBag = {}) {
    this.messageBag = messageBag;
  }

  any() {
    return this.count() > 0;
  }

  // Get total error fields..
  count() {
    return Object.keys(this.messageBag).length;
  }

  // Is field has an error?
  has(field) {
    return this.messageBag.hasOwnProperty(field);
  }

  // Get error message for field.
  get(field) {
    return this.has(field) ? this.messageBag[field][0] : null;
  }

  // Clear all or single field.
  clear(field = null) {
    if (field === null) {
      this.messageBag = {};

      return;
    }

    if (this.has(field)) {
      delete this.messageBag[field];
    }
  }

  // Collect errors data from API.
  collect(messageBag) {
    this.messageBag = messageBag;
  }
}
```

### Form Class

The `Form` class will be responsible for managing reactive data in our form and submitting our form data through the API.

```js
// core/Form.js

import Error from './Error';

export default class Form {
  constructor(data) {
    this.originalData = data;

    // We would like an easy access to the form's field data
    // for example: form.title or form.description
    for (let field in data) {
      this[field] = data[field];
    }

    this.isProcessing = false;
    this.error = new Error();
  }

  // Retrieve all reactive input data.
  data() {
    let data = {};

    for (let field in this.originalData) {
      data[field] = this[field];
    }

    return data;
  }

  // Reset the form.
  reset() {
    for (let field in this.originalData) {
      this[field] = '';
    }

    this.error.clear();
  }

  post(url) {
    return this.submit(url, 'POST');
  }

  // Submit the form data.
  submit(url, httpMethod = 'POST') {
    this.isProcessing = true;

    return new Promise((resolve, reject) => {
      axios[httpMethod.toLowerCase()](url, this.data())
        .then(response => {
          this.onSuccess(response.data);

          resolve(response.data);
        })
        .catch(error => {
          this.onError(error.response.data);

          reject(this.error);
        });
    });
  }

  onSuccess(data) {
    this.isProcessing = false;
    this.reset();
  }

  onError(errors) {
    this.isProcessing = false;
    this.error.collect(errors);
  }
}
```

### TaskForm Component

The `TaskForm` component will display our task form, it utilizes our `Form` class.

```js
// components/TaskForm.js

import Form from '../core/Form';

export default {
  template: `
    <form @keydown="form.error.clear($event.target.name)">
      <div class="form-group" :class="{ 'has-error': form.error.has('title') }">
        <label for="title" class="control-label">Title</label>
        <input type="text" class="form-control" name="title" id="title" placeholder="Title" v-model="form.title">
        <span class="help-block" v-if="form.error.has('title')">{{ form.error.get('title') }}</span>
      </div>
      <div class="form-group" :class="{ 'has-error': form.error.has('description') }">
        <label for="description" class="control-label">Description</label>
        <input type="text" class="form-control" name="description" id="description" placeholder="Description" v-model="form.description">
        <span class="help-block" v-if="form.error.has('description')">{{ form.error.get('description') }}</span>
      </div>
      <button type="submit" class="btn btn-default" @click.prevent="addTask" :disabled="form.error.any() || form.isProcessing">
        {{ form.isProcessing ? 'Saving...' : 'Save' }}
      </button>
    </form>
  `,

  data() {
    return {
      form: new Form({
        title: '',
        description: ''
      })
    };
  },

  methods: {
    // Submit the new task data through API.
    addTask() {
      this.form.post('api/tasks')
        .then(data => Event.$emit('task-is-added', data))
        .catch(error => console.error(error));
    },

    onSuccess(response) {
      // Emit task-is-added event, to be picked up by tasks components.
      Event.$emit('task-is-added', response.data);
    }
  }
}
```

### Tasks Component

Our `Tasks` component will display a list of our tasks data:

```js
// components/tasks.js

export default {
  template: `
    <ul>
      <li v-for="task in tasks" @click="toggleIsCompleted(task)">
        <span :class="{ 'text-danger': task.is_completed }">{{ task.title }}</span>
      </li>
    </ul>
  `,

  data() {
    return {
      tasks: []
    };
  },

  created() {
    axios.get('api/tasks')
      .then(response => this.tasks = response.data);

    Event.$on('task-is-added', task => this.tasks.push(task));
  },

  methods: {
    toggleIsCompleted(task) {
      task.is_completed = ! task.is_completed;

      axios.patch(`api/tasks/${task.id}`, task)
        .then(response => console.log(response));
    }
  }
};
```

### And Finally Our App

Our HTML should look very simple like this:

```html
<div id="app">
  <task-form></task-form>
  <tasks></tasks>
</div>
```

And our main `app.js` just simply registers our local components like so:

```js
import Vue from 'vue';
import axios from 'axios';
import Tasks from './components/Tasks';
import TaskForm from './components/TaskForm';

// Since we're going to use axios and Event class often it's a good idea
// to attach these to windows object, so we don't have to import it everytime
// we need to use it.
window.axios = axios;
window.Event = new Vue();

const app = new Vue({
  el: '#app',
  components: {
    Tasks,
    TaskForm
  }
});
```

### Bundling Up Our Applications

The last step is to bundle up our application with Webpack.

```bash
yarn add vue
yarn add axios

yarn add webpack --dev
yarn add babel-core --dev
yarn add babel-preset-es2015 --dev
yarn add babel-loader --dev
```

Create a `.babelrc` configuration file. Note that we disabled the `modules` transpiler, since Webpack will handle this for us.

```json
{
  "presets": [
    ["es2015", { "modules": false }]
  ]
}
```

Then create the `webpack.config.js`:

```js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: './resources/assets/js/app.js',
    vendor: ['vue', 'axios']
  },
  devtool: "cheap-module-eval-source-map",
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].bundle.js'
  },

  module: {
    rules: [
      // Transpile ES6 to ES5
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  resolve: {
    alias: {
      // Use vue runtime + compiler.
      'vue$': 'vue/dist/vue.esm.js'
    }
  },

  plugins: [
    // Split out our app and vendor file.
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    })
  );
}
```

Note that the NPM version of Vue does not include the compiler by default, just like the CDN version. That's why we need to create an alias to `vue.esm.js`.

Another new thing is the separation between our application bundle and the vendor bundle. We specify two entry points:

```js
entry: {
  app: './resources/assets/js/app.js',
  vendor: ['vue', 'axios']
}
```

The object's keys (`app` and `vendor`) will replace the `[name]` template in the `output` option:

```js
output: {
  path: path.resolve(__dirname, 'public/js'),
  filename: '[name].bundle.js'
},
```

Finally we need to register the `CommonsChunkPlugin` plugin.

```js
plugins: [
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor'
  })
]
```

We can add some NPM scripts to easily build our application:

```json
"scripts": {
  "dev": "export NODE_ENV=development && webpack --hide-modules --progress --watch",
  "build": "export NODE_ENV=development && webpack --hide-modules",
  "production": "export NODE_ENV=production && webpack --hide-modules"
},
```

## Shared State

Suppose you have two Vue instances that would like to display the same `user` object:

```html
<div id="one">{{ user.name }}</div>
<div id="two">{{ user.name }}</div>
```

And our JS file looks like this:

```js
const one = new Vue({
  el: '#one',
  data: {
    user: { name: 'Foo' }
  }
});

const two = new Vue({
  el: '#two',
  data: {
    user: { name: 'Foo' }
  }
});
```

But when you change the `user.name` on one of the Vue instances, the other `user.name` won't change. If you want to share the same `user` object, simply extract the `user` object to a global variable like so:

```js
let user = { name: 'Foo' };

const one = new Vue({
  el: '#one',
  data: {
    user: user
  }
});

const two = new Vue({
  el: '#two',
  data: {
    user: user
  }
});
```

## Custom Input

### v-model Syntactic Sugar

Suppose we have a pretty basic Vue app like this:

```html
<div id="app">
  <input type="text" v-model="message">
  <h2>{{ message }}</h2>
</div>
```

The `v-model` directive is actually just syntactic sugar for the following syntax:

```html
<div id="app">
  <input type="text" v-bind:value="message" v-on:input="message = $event.target.value">
  <h2>{{ message }}</h2>
</div>
```

Or the shorter version of this:

```html
<div id="app">
    <input type="text" :value="message" @input="message = $event.target.value">
    <h2>{{ message }}</h2>
</div>
```

### Custom Input

With the knowledge that the `v-model` directive is only syntactic sugar for binding the `value` attribute and handling the `input` event, we can create a custom input component that can receive the `v-model` directive. Check the following custom `<coupon>` tag:

```html
<div id="app">
    <coupon v-model="couponCode"></coupon>
    <h1>{{ couponCode }}</h1>
</div>
```

The custom `Coupon` component will receive a prop named `value`, which from the above example is bound to the `couponCode` data. You also need to emit the `input` event within the `Coupon` component and pass the input's value. Your `Coupon` component should look like this:

```js
Vue.component('coupon', {
  props: ['value'],
  template: `
    <input type="text" :value="value" @input="updateCouponCode($event.target.value)">
  `,
  methods: {
    updateCouponCode(value) {
      this.$emit('input', value);
    }
  }
});
```

You can put a validation or a data clean-up logic within `updateCouponCode`. For example, we will only allow the user to enter numeric characters for the coupon code, so we need to strip out the non-numeric characters like so:

```js
Vue.component('coupon', {
  props: ['value'],
  template: `
    <input type="text" ref="input" :value="value" @input="updateCouponCode($event.target.value)">
  `,
  methods: {
    updateCouponCode(value) {
      // Remove non numeric characters.
      value = value.replace(/\D/g, '');

      // Update the input's value.
      this.$refs.input.value = value;

      this.$emit('input', value);
    }
  }
});
```

Note that we use the `ref` attribute on our input, so we can refer to it later in the `updateCouponCode` method:

```js
// Update the input's value.
this.$refs.input.value = value;
```

## Organized Component and Vue-Loader

Wouldn't it be nice if you could organize your Vue component just like the following file:

```html
// components/Message.vue
<template>
  <div class="message">{{ message }}</div>
</template>

<script>
  export default {
    data() {
      return { message: 'Hello World' };
    }
  }
</script>

<style lang="scss" scoped>
  $color: red;

  .message {
    color: $color;
  }
</style>
```

In fact you can! Out of the box, Laravel Mix allows us to use this nice component organization. But if you're not going to use Laravel Mix, you can configure your own Webpack configuration.

Install all of the required dependencies:

```bash
# Webpack and babel
yarn add webpack babel-core babel-preset-es2015 babel-loader --dev

# Vue loader and template compiler to allow use organizing vue component file.
yarn add vue-loader vue-template-compiler --dev

# To allow CSS pre-processing
yarn add css-loader node-sass sass-loader --dev
```

Next create your `.babelrc` file:

```json
{
  "presets": [
    ["es2015", { "modules": false }]
  ]
}
```

We set the `modules` option to `false`, since Webpack will handle this for us. Next create your `webpack.config.js` file:

```js
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: './resources/assets/js/app.js',
    vendor: ['vue', 'vue-router', 'axios']
  },
  devtool: "cheap-module-eval-source-map",
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader',
            scss: 'vue-style-loader!css-loader!sass-loader'
          }
        }
      }
    ]
  },

  resolve: {
    extensions: ['*', '.js', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true
    })
  );
}
```

Here's the part that you should pay attention to:

```js
{
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      js: 'babel-loader',
      scss: 'vue-style-loader!css-loader!sass-loader'
    }
  }
}
```

Here we are registering the `vue-loader` to process the `*.vue` files, allowing you to write a well organized Vue component with `<template>`, `<script>` and `<style>` tags. Also notice this part:

```js
resolve: {
  extensions: ['*', '.js', '.vue'],
  alias: {
    'vue$': 'vue/dist/vue.esm.js'
  }
}
```

We register the `.vue` file extension so you can import the Vue component without the `.vue` extension:

```js
// From this
import Message from './components/Message.vue';

// Become this
import Message from './components/Message';
```

### Scoped Style

Notice that we use the `scoped` attribute on the `<style>` tag:

```html
<style lang="scss" scoped>
  $color: red;

  .message {
    color: $color;
  }
</style>
```

This will make the declared style only apply to the current component.

## Basic Vue Router

### Declaring Routes

You can create a `routes.js` file to store all of your application's routes. You export an instance of `VueRouter` where you pass the `routes` array. `path` is your route's path, and `component` is the Vue component that will be displayed once your route is visited.

```js
// routes.js
import VueRouter from 'vue-router';
import Home from './views/Home';
import About from './views/About';
import Contact from './views/Contact';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact }
];

export default new VueRouter({
  routes,
  linkActiveClass: 'is-active'	// Override the active class
});
```

### Attaching Routes to Vue Instance

First you have to tell Vue to `use` the `VueRouter` plugin. Then once you've exposed your `VueRouter` instance within your `routes.js` file, you can just pass it to your main Vue instance:

```js
// app.js
import Vue from 'vue';
import VueRouter from 'vue-router';
import router from './routes';

window.Vue = Vue;

// Tell vue to use VueRouter plugin.
Vue.use(VueRouter);

const app = new Vue({
  el: '#app',
  router
});
```

### Our View Components

Next you have to create your view components. Here's a simple Vue component for the home page, it just displays the "Home" title:

```html
// views/Home.vue
<template>
  <h1>Home</h1>
</template>

<script>
  export default {
    //
  }
</script>
```

Create the remaining views for `Contact` and `About`.

### Our Main Application

```html
<div id="app">
  <!-- Link to the route. -->
  <router-link to="/">Home</router-link>
  <router-link to="/about">About</router-link>
  <router-link to="/contact">Contact</router-link>

  <!-- View component will be rendered here. -->
  <router-view></router-view>
</div>
```

Note that the `<router-link>` will be rendered as an anchor tag:

```html
<a href="#/" class="is-active">Home</a>
<a href="#/about" class="is-active">About</a>
<a href="#/contact" class="is-active">Contact</a>
```

But if you want to wrap it with another tag, you can set the `tag` attribute like so:

```html
<router-link to="/" tag="li"><a>Home</a></router-link>

<!-- Will become. -->
<li class="is-active"><a href="#/">Home</a></li>
```

You'll also notice that the link to `/` will also match the links to `/about` and `/contact`. You can solve this by passing the `exact` attribute to `<router-link>`:

```html
<router-link to="/" tag="li" exact><a>Home</a></router-link>
```
