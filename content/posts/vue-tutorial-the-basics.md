---
title: "Vue Tutorial: The Basics"
description: >
    Learn the basics of Vue.js. From data binding, conditionals, lists and event listeners, to computed properties,
    components, slots and component communication.
date: 2017-03-19T10:00:00+02:00
categories: [tutorial]
tags: [javascript, vue]
images: [/img/vue.png]
---
These are my notes from following the VueCast series, a set of screencasts about Vue.js. The code here is written for Vue 2: components use the `mounted()` hook, events are triggered with `$emit`, and there is no build step, just a plain `new Vue({ el })` on a page. I kept the code exactly as I wrote it back then.

This first part covers the basics, from data binding all the way to component communication. The second part, [Vue Tutorial: Building Real Apps](/posts/vue-tutorial-building-real-apps/), covers Ajax, Webpack, forms and routing.

{{<toc>}}

## Basic Data Binding

Before starting, it's a good idea to install the Vue dev tools: [vue-devtools](https://github.com/vuejs/vue-devtools).

We can use the `v-model` attribute to bind an input element with the Vue's data. We can also display the data with a mustache like syntax: `{{ data }}`.

The HTML part:

```html
<div id="app">
    <input type="text" v-model="message">
    <p>Message: {{ message }}</p>
</div>
```

The JS part:

```js
new Vue({
    el: '#app',
    data: {
        message: 'Hello World!'
    }
});
```

The `el` option defines which part of the HTML should be turned into the Vue application. The `data` option defines the data that will be used by the Vue application. At first, the `message` value will be `Hello World!` and it will be displayed both in the input text and within the `p` tag.

When we change the input text, the `message` value will also be updated automatically, and so does the text within the `p` tag.

It also works the other way around. If we change the underlying data, it will be reflected on the view. Once we have the Vue dev tools installed, click on the `<Root>` within the `vue` tab, this way we can access the temporary `$vm0` variable. `$vm0` is a temporary variable that can be used to access the Vue instance. Now within the console, we can change the `message` data like this:

```js
$vm0.message = 'Hello Vue!';
```

## The IF Directive

The `v-if` directive will render an element if the given condition is `TRUE`.

The HTML file:

```html
<div id="app">
    <h1 v-if="isAdmin">Hello Administratior</h1>
</div>
```

The JS file:

```js
new Vue({
  el: '#app',
  data: {
    isAdmin: true
  }
});
```

The `h1` element will be rendered on the view if the `isAdmin` data is `TRUE`. We can also set an expression directly like `v-if="10 > 9"`.

There's also the `v-else` directive, to indicate the else block for our `v-if`. The `v-else` element must immediately follow the `v-if` element in order to work.

```html
<div id="app">
    <h1 v-if="isAdmin">Hello Administratior</h1>
    <h1 v-else>Hello World</h1>
</div>
```

## List

To loop through a list, Vue provides a directive named `v-for`. Suppose the Vue has a data named `names` which is an array of names. To loop through the `names`, our HTML will look like this:

```html
<div id="app">
    <ul>
        <li v-for="name in names">{{ name }}</li>
    </ul>
</div>
```

Or we can also use the `v-text` directive instead of the mustache syntax:

```html
<div id="app">
    <ul>
        <li v-for="name in names" v-text="name"></li>
    </ul>
</div>
```

And now the JavaScript file:

```js
new Vue({
    el: '#app',
    data: {
        names: ['John', 'Jane']
    }
});
```

## Event Listener

### Adding Item to The List (The Old Way)

We now have our list of names displayed. What about adding an input to add a name to our list? First, add an input text and a button to our HTML:

```html
<div id="app">
    <ul>
        <li v-for="name in names" v-text="name"></li>
    </ul>

    <input type="text" id="input">
    <button id="button">Add Name</button>
</div>
```

We are going to do this the old way, by adding an event listener and retrieving the input value manually:

```js
new Vue({
    el: '#app',
    data: {
        names: ['John', 'Jane']
    },
    mounted() {
        document.querySelector('#button').addEventListener('click', () => {
            let input = document.querySelector('#input');

            this.names.push(input.value);

            input.value = '';
        });
    }
});
```

The `mounted()` method will be called once the Vue application is mounted to the DOM.

### The Vue Way

Now with Vue we no longer need to traverse the DOM, add an event listener and manually retrieve the input. To add an event listener to the DOM with Vue, we can use the `v-on:event` directive. The directive requires one argument, which is the type of the event. So if we want to register an on-click event we can do it like this:

```html
<div id="app">
    <ul>
        <li v-for="name in names" v-text="name"></li>
    </ul>

    <input type="text" v-model="newName">
    <button v-on:click="addName">Add Name</button>
</div>
```

There's also a shorthand for the `v-on:click` directive: `@click`.

```html
<button @click="addName">Add Name</button>
```

Next we have to add the `addName` handler within the Vue's `methods` object:

```js
new Vue({
    el: '#app',
    data: {
        names: ['John', 'Jane'],
        newName: ''
    },
    methods: {
        addName() {
            this.names.push(this.newName);
            this.newName = '';
        }
    }
});
```

## Attribute and Class Binding

Vue also offers a directive for binding an attribute or a property of the element: `v-bind`. The `v-bind` directive requires one argument named `attrOrProp`, which is the name of the attribute or the property. For example, if we want to bind the `myTitle` data to the button's title attribute, we do it like this.

The HTML part:

```html
<div id="app">
    <button v-bind:title="myTitle">Button</button>
</div>
```

The JS part:

```js
new Vue({
    el: '#app',
    data: {
        myTitle: 'My Title'
    }
});
```

There's also a shorthand that we can use:

```html
<button :title="myTitle">Button</button>
```

With this `v-bind` directive, we can also bind the element's classes like this:

```html
<button :class="myClassName">Button</button>
```

### Conditionally Add Class

Besides binding it directly to the Vue's data, we can also conditionally add a class to an element with the following syntax:

```html
<element :class="{ 'class-name' : condition }"></element>
```

The `class-name` will be added to the element's class attribute if the given `condition` is `TRUE`. So for example, the HTML part:

```html
<div id="app">
    <button :class="{ 'btn-danger' : isActive }" @click="toggleActiveStatus">Button</button>
</div>
```

The JS part:

```js
new Vue({
    el: '#app',
    data: {
        isActive: false
    },
    methods: {
        toggleActiveStatus() {
            this.isActive = ! this.isActive;
        }
    }
});
```

## Computed Properties

Suppose we would like to display the `message` data, but in reversed order. We can do it inline within the `v-text` directive or the mustache template like this:

```html
<div id="app">
    <h1 v-text="message.split('').reverse().join('')"></h1>
</div>
```

Although Vue can evaluate an expression within the template, the above example has too much logic. It's bloated and harder to maintain. There's a better way to do this, using Vue's computed property:

```js
new Vue({
    el: '#app',
    data: {
        message: 'Hello World'
    },
    computed: {
        reversedMessage() {
            return this.message.split('').reverse().join('');
        }
    }
});
```

Now we can simply refer to the computed `reversedMessage` property like so:

```html
<div id="app">
    <h1>{{ reversedMessage }}</h1>
</div>
```

### Todo List Example

Suppose we have a Vue application that will loop through the `tasks` data and display it on the list.

The HTML file:

```html
<div id="app">
    <ul>
        <li v-for="task in tasks" v-text="task.description"></li>
    </ul>
</div>
```

The JS file:

```js
new Vue({
    el: '#app',
    data: {
        tasks: [
            { description: 'Learn Vue.js', completed: false },
            { description: 'Learn ES 2015', completed: true },
            { description: 'Make dinner', completed: false }
        ]
    }
});
```

And now to display only the incomplete tasks using Vue's computed property, we need to update our Vue code like this:

```js
new Vue({
    el: '#app',
    data: {
        tasks: [
            { description: 'Learn Vue.js', completed: false },
            { description: 'Learn ES 2015', completed: true },
            { description: 'Make dinner', completed: false }
        ]
    },
    computed: {
        incompleteTasks() {
            return this.tasks.filter(task => ! task.completed);
        }
    }
});
```

Now we have access to the computed `incompleteTasks` property within our view:

```html
<ul>
    <li v-for="task in incompleteTasks" v-text="task.description"></li>
</ul>
```

## Components

To create a global component, we simply call the `component()` static method like this:

```js
Vue.component('heading', {
  template: '<h1>My Heading</h1>'
});
```

The first argument is the component name, in this case it's `heading`. The second argument is the component's options. The `template` option defines how the component will be rendered within the view.

Once the component is registered, we can start using our `heading` component within our Vue application like this:

```html
<div id="app">
    <heading></heading>
</div>
```

### The `slot` Element

What if we want to allow the user to set the content of the `heading` like this:

```html
<heading>Foo Bar</heading>
```

Currently our `heading` component will always display the `My Heading` text. To allow user defined content, we can use the `<slot>` element within our template:

```js
Vue.component('heading', {
  template: '<h1><slot></slot></h1>'
});
```

## Components within Component

With Vue we can also use other custom components within our component's template. For example, we're going to create a `task-list` component that consists of multiple `task` components. First we're going to register a new `task` component, it's simply an `li` element:

```js
Vue.component('task', {
  template: '<li><slot></slot></li>'
});
```

Next, we need to register the `task-list` component which uses the `task` component to render a list of tasks:

```js
Vue.component('task-list', {
  template: '<ul><task v-for="task in tasks" v-text="task"></task></ul>',
  data() {
    return {
      tasks: ['Learn Vue.js', 'Learn ES 2015']
    };
  }
});
```

Note that when creating a component, the `data` option must be a function and not an object, unlike when we're instantiating a Vue application. Also, the rendered component must have one root element, and since we're using the `v-for` directive it must be enclosed in one. The root element can be anything, but in this case we're using `ul`.

## Component with Attribute

We can also create a custom component that accepts an attribute. For example, we're going to create a `message` component, which is based upon [Bulma's message component](http://bulma.io/documentation/components/message/). We're hoping to use this `message` component like this:

```html
<div id="app">
    <message title="The Title">The message body.</message>
</div>
```

In order to access the `title` attribute, we need to register it within the `props` option like so:

```js
Vue.component('message', {
  props: ['title'],
  template: `
    <article class="message">
      <div class="message-header">
        <p>{{ title }}</p>
      </div>
      <div class="message-body">
        <slot></slot>
      </div>
    </article>
  `
});
```

## Component's Event Handler

We're going to take the previous example even further by adding an event listener to the component. Bulma's message component provides a close button element. We're going to add a click event listener to this button, so when it's clicked it will remove the message element.

```js
Vue.component('message', {
  props: ['title'],
  template: `
    <article class="message" v-if="isVisible">
      <div class="message-header">
        <p v-text="title"></p>
        <button class="delete" @click="close"></button>
      </div>
      <div class="message-body">
        <slot></slot>
      </div>
    </article>
  `,
  data() {
    return {
      isVisible: true
    };
  },
  methods: {
    close() {
      this.isVisible = false;
    }
  }
});
```

Like any other directives, we can simply add an event listener by using the `@click` or `v-on:click` directive directly within the `template` option. Now whenever the button is clicked, it will call the `close()` method. The `v-if` directive will cause the element to be removed when the `isVisible` data is set to `FALSE`.

Since the logic is quite simple, we can even inline the handler and remove the `close()` method entirely:

```html
<button class="delete" @click="isVisible = false"></button>
```

## Bulma's Modal Component with Vue

This time we're going to turn [Bulma's modal component](http://bulma.io/documentation/components/modal/) into a Vue component. Register a new global component named `modal` like this:

```js
Vue.component('modal', {
  template: `
    <div class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-content"><slot></slot></div>
      <button class="modal-close" @click="$emit('close')"></button>
    </div>
  `
});
```

Note that when the close button is clicked, we call `$emit('close')`. This code will trigger a custom event within the component named `close`, so we can listen to it with the `@close` or `v-on:close` directive.

Now moving to our `modal` component implementation.

The HTML part:

```html
<div id="app">
    <button type="button" @click="isModalVisible = true">Show Modal</button>
    <modal v-if="isModalVisible" @close="isModalVisible = false">
        <div class="box">Hello World!</div>
    </modal>
</div>
```

The JS part:

```js
new Vue({
  el: '#app',
  data: {
    isModalVisible: false
  }
});
```

Note that we use the `isModalVisible` boolean data to control whether the `modal` element is rendered or not. The `@close` directive will listen to the custom `close` event triggered by the component when the close button is clicked.

## Bulma's Tab Component with Vue

Bulma provides us a style for creating a [tab component](http://bulma.io/documentation/components/tabs/), but it still misses the functionality. We're going to provide the interactivity by creating a custom tab component with Vue. Imagine we can declare a tab component like this:

```html
<div id="app">
    <tabs>
        <tab name="Home" :selected="true">
            Home tab
        </tab>
        <tab name="About Us">
            About us tab
        </tab>
        <tab name="Contact">
            Contact tab
        </tab>
    </tabs>
</div>
```

The `name` title will be displayed on the tab link, while the `selected` attribute will define which tab is active by default. First, we're going to need to register the `tab` component:

```js
Vue.component('tab', {
  props: {
    name: { required: true },
    selected: { default: false }
  },

  template: `
    <div v-if="isActive"><slot></slot></div>
  `,

  data() {
    return {
      isActive: false
    }
  },

  computed: {
    href() {
      return '#' + this.name.toLowerCase().replace(/ /g, '-');
    }
  },

  mounted() {
    this.isActive = this.selected;
  }
});
```

As we may already know, the `props` option defines which attributes or properties the component can use:

```js
props: {
  name: { required: true },
  selected: { default: false }
}
```

The `name` attribute is required to create a `tab` element, while the `selected` attribute will have a default value of `false`.

The template uses the `isActive` data to determine whether the tab will be rendered to the view or not.

```html
<div v-if="isActive"><slot></slot></div>
```

You might wonder why we need the `isActive` data, when we actually have the `selected` prop. The reason is that props should not be changed from within the component, so we cannot use it to track which tab is active. See the `mounted` method, this is where we assign the `selected` prop's value to the `isActive` data.

```js
mounted() {
  this.isActive = this.selected;
}
```

On the `computed` object, we also define a `href()` method which will return an anchor link based on the tab's name.

```js
href() {
  return '#' + this.name.toLowerCase().replace(/ /g, '-');
}
```

Our `tab` component is in place, now it's time to create the `tabs` component:

```js
Vue.component('tabs', {
  template: `
    <div>
      <div class="tabs">
        <ul>
          <li v-for="tab in tabs" :class="{ 'is-active': tab.isActive }">
            <a :href="tab.href" @click="selectTab(tab)">{{ tab.name }}</a>
          </li>
        </ul>
      </div>
      <div>
        <slot></slot>
      </div>
    </div>
  `,

  data() {
    return {
      tabs: []
    }
  },

  created() {
    this.tabs = this.$children;
  },

  methods: {
    selectTab(selectedTab) {
      this.tabs.forEach(tab => tab.isActive = (tab.name === selectedTab.name));
    }
  }
});
```

See the `created()` method, this part of the code will be executed once the component is created. In this method, we're assigning the `$children` property to the `tabs` data, which consists of the multiple `tab` components that we have defined in our HTML. Also note that in order to use the `tabs` data, we still need to declare it within the `data()` method.

```js
created() {
  this.tabs = this.$children;
},
```

Within the `template` option, we'll find this part of the code that will loop through the `tabs` data and render the `li` elements:

```html
<li v-for="tab in tabs" :class="{ 'is-active': tab.isActive }">
  <a :href="tab.href" @click="selectTab(tab)">{{ tab.name }}</a>
</li>
```

The `li` element will be assigned an `is-active` class if the tab has an `isActive` property value of `true`. You may also notice that we add an event listener which will call the `selectTab()` method when the link is clicked. We also pass the current `tab` component to the handler:

```js
methods: {
  selectTab(selectedTab) {
    this.tabs.forEach(tab => tab.isActive = (tab.name === selectedTab.name));
  }
}
```

In the above `selectTab` method, we simply set the `isActive` data to `true` for the selected tab and `false` for the rest.

## Component Communication between Child and Parent with Custom Event

A child component can communicate with its parent by emitting a custom event. For example, we have a `coupon` component, which will emit a custom event named `coupon-was-applied` once we enter something in the coupon input text:

```html
<div id="app">
    <coupon @coupon-was-applied="couponWasApplied"></coupon>
</div>
```

Now we need to register our custom `coupon` component:

```js
Vue.component('coupon', {
  template: `<input type="text" v-model="couponCode" @blur="applyCoupon">`,
  data() {
    return { couponCode: '' };
  },
  methods: {
    applyCoupon() {
      this.$emit('coupon-was-applied', {
        'couponCode': this.couponCode,
        'message': 'Coupon was applied successfully!'
      });
    }
  }
});
```

Note that the component will call the `applyCoupon` method on the blur event. And within the `applyCoupon` method we emit a custom event named `coupon-was-applied`, which later will be caught by the root application. We may also pass an argument when triggering a custom event with the `$emit` method.

Finally, within our root application we need to define the `couponWasApplied` method to handle the `coupon-was-applied` event.

```js
new Vue({
  el: '#app',
  methods: {
    couponWasApplied(data) {
      console.log(data);
    }
  }
});
```

## Component Communication with Event Dispatcher

With the previous approach, the components can only communicate from the child to its parent. What if we want to communicate between siblings? Or even between two unrelated components? To solve this issue we have to create a global event dispatcher instance.

We know that each Vue instance has the ability to emit (`$emit`) or listen (`$on`) to an event. With this knowledge we can create a global variable named `Event`, which is basically just an instance of Vue:

```js
window.Event = new Vue();
```

Now to emit an event, we can do it like this:

```js
Event.$emit('event-name', data);
```

And for listening to an event:

```js
Event.$on('event-name', callback);
```

We can modify our previous example with this approach:

```js
window.Event = new Vue();

Vue.component('coupon', {
  template: `<input type="text" v-model="couponCode" @blur="applyCoupon">`,
  data() {
    return { couponCode: '' };
  },
  methods: {
    applyCoupon() {
      Event.$emit('coupon-was-applied', {
        'couponCode': this.couponCode,
        'message': 'Coupon was applied successfully!'
      });
    }
  }
});

new Vue({
  el: '#app',
  created() {
    Event.$on('coupon-was-applied', (data) => console.log(data));
  }
});
```

### Refactoring the Event Dispatcher

We can refactor the global `Event` instance for a nicer API:

```js
window.Event = new class {
  constructor() {
    this.vue = new Vue;
  }

  fire(event, data = null) {
    return this.vue.$emit(event, data);
  }

  listen(event, callback) {
    return this.vue.$on(event, callback);
  }
}
```

With these changes, we can update our previous code like so:

```js
// Emit an event
Event.fire('coupon-was-applied', {
  'couponCode': this.couponCode,
  'message': 'Coupon was applied successfully!'
});

// Listen to an event.
Event.listen('coupon-was-applied', (data) => console.log(data));
```

## Named Slot

We already know how to use `<slot>` within our component's template. What if we need multiple slots for a component? For example, in a modal component where we need the title, content and footer sections. To tackle this issue, Vue allows us to use named slots. Here's an example for a modal component:

```js
Vue.component('modal', {
  template: `
    <div class="modal is-active">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title"><slot name="title"></slot></p>
          <button class="delete"></button>
        </header>
        <section class="modal-card-body"><slot></slot></section>
        <footer class="modal-card-foot">
          <slot name="footer">
            <a class="button is-primary">Ok</a>
          </slot>
        </footer>
      </div>
    </div>
  `
});
```

To create a named slot we simply add a `name` attribute, just like on the header:

```html
<slot name="title"></slot>
```

Notice on the body section, we do not use a `name` attribute. This is called a default slot, where the user does not need to specify the `slot` attribute when filling up this slot.

Also notice on the footer section, the `<slot>` tag has content. This is the default content that will be rendered if the user does not fill up this slot. Here's how we use this component within our HTML:

```html
<div id="app">
    <modal>
        <template slot="title">My Title</template>
        My modal content...
    </modal>
</div>
```

Notice in the above example, we use the `<template>` tag to fill up a named slot. Actually it doesn't have to be a `<template>` tag, it can be anything: `h1`, `p`, etc. But if you want to slot in some text without any additional markup, use the `<template>` tag.

```html
<template slot="slotName">Slot content goes here...</template>
```

You may also notice that some text is not enclosed within the `<template>` tag or any tag with a `slot` attribute. This text (the `My modal content...` part) will be put in the default `slot`, the one without the `name` attribute, which is the modal's body in our case.

In the code above, we also do not provide content for the footer's slot. This is because the footer slot already provides default content: a button with an "OK" text. We can also replace the default footer if we want:

```html
<div id="app">
    <modal>
        <template slot="title">My Title</template>
        My modal content...
        <template slot="footer">
            <a class="button is-success">Save changes</a>
            <a class="button">Cancel</a>
        </template>
    </modal>
</div>
```

## Component with Inline Template

Vue allows us to create a component and define the template inline, without passing it into the `template` option. This is suitable if you need a one-time-use component that will not be reused in any other part of the code. To use an inline template, simply add the `inline-template` attribute when using the component:

```html
<div id="app">
    <progress-view inline-template>
        <div>
            <h1>Your progress: {{ progressPercentage }}%</h1>
            <button @click="progressPercentage += 5">Increase</button>
        </div>
    </progress-view>
</div>
```

However, you still need to register the component within your JS file:

```js
Vue.component('progress-view', {
  data() {
    return { progressPercentage: 35 };
  }
});
```

Also notice that we wrapped the `h1` and the `button` within a `div` tag. This is because a component must have a single root element, and we are rendering multiple elements.
