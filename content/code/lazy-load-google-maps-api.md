---
title: Lazy Load Google Maps API
date: 2019-04-26T19:31:00+02:00
description: How to create a simple function to lazy load the Google Maps JavaScript API library.
categories: [log]
tags: [javascript, maps]
images: [/img/google-maps.png]
---
Yesterday I was combing through the [vue2-google-maps](https://github.com/xkjyeah/vue-google-maps) source code. It's a collection of Google Maps components for Vue. Then I found an interesting bit of how it loads the Google Maps JavaScript API lazily (check the [`src/manager.js`](https://github.com/xkjyeah/vue-google-maps/blob/vue2/src/manager.js) and the [`src/main.js`](https://github.com/xkjyeah/vue-google-maps/blob/vue2/src/main.js)).

It's pretty useful, especially if you build a SPA (single page application) where there are pages that don't actually use the Google Maps API. By lazy loading the Google Maps API, your users will only have to download the library once they hit the page that uses it.

## Inject Google Maps API Programmatically

Let's get to the code! I'll use the snippets from vue2-google-maps, but making it a bit simpler. First, we'll need a function to dynamically inject the Google Maps JavaScript API to our page:

```js
let googleMapsScriptIsInjected = false;

const injectGoogleMapsApiScript = (options = {}) => {
  if (googleMapsScriptIsInjected) {
    throw new Error('Google Maps Api is already loaded.');
  }

  const optionsQuery = Object.keys(options)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(options[k])}`)
    .join('&');

  const url = `https://maps.googleapis.com/maps/api/js?${optionsQuery}`;

  const script = document.createElement('script');

  script.setAttribute('src', url);
  script.setAttribute('async', '');
  script.setAttribute('defer', '');

  document.head.appendChild(script);

  googleMapsScriptIsInjected = true;
};
```

When you call this `injectGoogleMapsApiScript` function, it will inject the Google Maps API JavaScript into the document's `<head>`. We also use the `googleMapsScriptIsInjected` variable to make sure that the Google Maps library is injected only once. Here's how we call this function:

```js
injectGoogleMapsApiScript({
  key: YOUR_API_KEY,
  callback: 'initMap',
});
```

And here's an example of the `<script>` that being injected to the `<head>`.

```html
// Here's the script that will be injected
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap"
    async defer></script>
```

## Get Google Maps API Instance

The `async` and `defer` attributes are used to tell the browser to load the given script asynchronously. So even if you put your JavaScript code after the Google Maps API `<script>` tag, there's no guarantee that Google Maps API instance is available for you to use.

That's why you can pass the `callback` query parameter when loading the Google Maps API. The `callback` parameter defines the function name that will be called once the Google Maps API is loaded. When it's loaded, the Google Maps API instance will be available globally under the `google.maps` name.

For a simple application, you can just put your Google Maps related code within the `callback` function and you're good to go. But it's a bit trickier for a SPA where the components that rely on the Google Maps API spread across multiple pages.

So how do we let our application knows when the `callback` function is invoked thus our code can access the Google Maps API instance? With `Promise`!

```js
let googleMapsApiPromise = null;

const loadGoogleMapsApi = (apiKey, options = {}) => {
  if (!googleMapsApiPromise) {
    googleMapsApiPromise  = new Promise((resolve, reject) => {
      try {
        window.onGoogleMapsApiLoaded = resolve;

        injectGoogleMapsApiScript({
          key: apiKey,
          callback: 'onGoogleMapsApiLoaded',
          ...options,
        });
      } catch (error) {
        reject(error);
      }
    }).then(() => window.google.maps);
  }

  return googleMapsApiPromise;
};
```

The `loadGoogleMapsApi` function above will return a `Promise` where it's `resolve` function is set as the Google Maps API `callback` parameter. This way when the Google Maps API is loaded, the `Promise` will be resolved and move to the next `then` block that returns the Google Maps API instance.

Here's how you're going to use this function:

```js
loadGoogleMapsApi(YOUR_API_KEY)
  .then((maps) => {
    // Your google maps code
    const myMap = new maps.Map(element, options);
    const myMarker = new maps.Marker({ map: myMap });
  });
```

There's still a drawback though, where you have to provide the API key every time you call the `loadGoogleMapsApi` function. You can of course hardcode the API key within the `loadGoogleMapsApi` or the `injectGoogleMapsApiScript` functions, but it'll make your functions less reusable.

To solve this, we can wrap the returned `Promise` within the Lodash's [`once`](https://www.npmjs.com/package/lodash.once) function or this [`lazy-value`](https://github.com/sindresorhus/lazy-value) function. It's super simple though, so let's write it ourself:

```js
const lazyValue = (fn) => {
  let called = false;
  let returnValue;

  return () => {
    if (!called) {
      called = true;
      returnValue = fn();
    }

    return returnValue;
  };
};

const loadGoogleMapsApi = (apiKey, options = {}) => lazyValue(
  () => new Promise((resolve, reject) => {
    try {
      window.onGoogleMapsApiLoaded = resolve;

      injectGoogleMapsApiScript({
        key: apiKey,
        callback: 'onGoogleMapsApiLoaded',
        ...options,
      });
    } catch (error) {
      reject(error);
    }
  }).then(() => window.google.maps),
);
```

Now, all you have to do is creating a globally accessible variable that holds the return value of `loadGoogleMapsApi` function:

```js
window.googleMapsApiLazyValue = loadGoogleMapsApi(YOUR_API_KEY);

// On your code.
window.googleMapsApiLazyValue()
  .then((maps) => {
    // Your google maps code
    const myMap = new maps.Map(element, options);
    const myMarker = new maps.Marker({ map: myMap });
  });
```

## Put it Together

Let's put it all the pieces together.

```js
// loadGoogleMapsApi.js
let googleMapsScriptIsInjected = false;

const injectGoogleMapsApiScript = (options = {}) => {
  if (googleMapsScriptIsInjected) {
    throw new Error('Google Maps Api is already loaded.');
  }

  const optionsQuery = Object.keys(options)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(options[k])}`)
    .join('&');

  const url = `https://maps.googleapis.com/maps/api/js?${optionsQuery}`;

  const script = document.createElement('script');

  script.setAttribute('src', url);
  script.setAttribute('async', '');
  script.setAttribute('defer', '');

  document.head.appendChild(script);

  googleMapsScriptIsInjected = true;
};

const lazyValue = (fn) => {
  let called = false;
  let returnValue;

  return () => {
    if (!called) {
      called = true;
      returnValue = fn();
    }

    return returnValue;
  };
};

const loadGoogleMapsApi = (apiKey, options = {}) => lazyValue(
  () => new Promise((resolve, reject) => {
    try {
      window.onGoogleMapsApiLoaded = resolve;

      injectGoogleMapsApiScript({
        key: apiKey,
        callback: 'onGoogleMapsApiLoaded',
        ...options,
      });
    } catch (error) {
      reject(error);
    }
  }).then(() => window.google.maps),
);

export default loadGoogleMapsApi;
```

Here's how I use it on my Vue application, where I assign the `loadGoogleMapsApi` return value on the Vue's prototype.

```js
import Vue from 'vue';
import loadGoogleMapsApi from './loadGoogleMapsApi';

Vue.prototype.$loadGoogleMapsApi = loadGoogleMapsApi(
  process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
);
```

This way I can easily access the Google Maps API instance from any components:

```vue
<template>
  <div ref="map" />
</template>

<script>
export default {
  data() {
    return {
      map: null,
    };
  },
  async mounted() {
    const maps = await this.$loadGoogleMapsApi();

    this.map = new maps.Map(this.$refs.map, {
      center: { lat: 40, lng: -100 },
      zoom: 4,
    });
  },
};
</script>
```
