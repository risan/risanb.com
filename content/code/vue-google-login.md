---
title: "Vue.js: Implement Log In with Google Feature"
date: 2020-11-08T20:28:00+07:00
description: How to implement Google Sign-In feature within a Vue.js project.
categories: [snippet]
tags: [javascript, vue]
images: [/img/vue.png]
---
This weekend, I was tinkering with the latest version of Vue.js (v3) and the official Google API client library for JavaScript. I tried to implement the "Log In with Google" feature on a Vue.js project. I scaffolded the project using the [Vue CLI](https://cli.vuejs.org/). Added [Vue Router](https://router.vuejs.org/) for routing and [Vuex](https://vuex.vuejs.org/) for state management.

First, we need to include the Google API client library on our HTML file. Note that we're using the `defer` property so it won't block the browser from parsing the rest of the HTML file. We also pass the `onload` query. This query defines the function name that will be called when the client library is loaded.

```html
<head>
  ...
  <script src="https://apis.google.com/js/api.js?onload=onGoogleApiLoad" defer></script>
</head>
```

To implement the OAuth 2.0 authentication with Google API client library, we also need to load the separate `auth2` module. This process happens asynchronously and Google uses the callback style on this part.

```js
gapi.load('client:auth2', () => {
  // auth2 module ready to initialized.
});
```

To make this process fits nicely within our Vue.js project, we'll create a wrapper class named `Auth.js`.

```js
// src/Auth.js
class Auth extends EventTarget {
  constructor({ apiKey, clientId }) {
    super();

    this.apiKey = apiKey;
    this.clientId = clientId;
  }

  init() {
    return new Promise((resolve, reject) => {
      window.gapi.load('client:auth2', async () => {
        try {
          await window.gapi.client.init({
            apiKey: this.apiKey,
            clientId: this.clientId,
            // List of discovery docs that we'll use on our application.
            // On this example we're using Google Drive API.
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            ],
            // The scopes we're using separated by space.
            // https://developers.google.com/identity/protocols/oauth2/scopes
            scope: 'https://www.googleapis.com/auth/drive.metadata.readonly',
          });

          window.gapi.auth2
            .getAuthInstance()
            .isSignedIn.listen(status =>
              status
                ? this.dispatchEvent(new Event('loggedIn'))
                : this.dispatchEvent(new Event('loggedOut'))
            );

          resolve(window.gapi);
        } catch (error) {
          reject(new Error(error.error.message));
        }
      });
    });
  }
}

export default Auth;
```

On `init` method, we're converting the callback style into a promise-based. The promise will be resolved once the `auth2` module is loaded and initialized.

Note that we also derive the `Auth` class from the `EventTarget` class. This way we easily dispatch an event when the user's login status changes.

```js
window.gapi.auth2
  .getAuthInstance()
  .isSignedIn.listen(status =>
    status
      ? this.dispatchEvent(new Event('loggedIn'))
      : this.dispatchEvent(new Event('loggedOut'))
  );
```

Next, we'll create a Vuex module named `auth` to keep track of the user's login status within our application.

```js
// store/auth.js
const auth = {
  namespaced: true,

  state() {
    return {
      isLoggedIn: null,
    };
  },

  mutations: {
    logIn(state) {
      state.isLoggedIn = true;
    },

    logOut(state) {
      state.isLoggedIn = false;
    },
  },

  actions: {
    loadInitialState(context) {
      window.gapi.auth2.getAuthInstance().isSignedIn.get()
        ? context.commit('logIn')
        : context.commit('logOut');
    },

    logIn() {
      window.gapi.auth2.getAuthInstance().signIn();
    },

    logOut() {
      window.gapi.auth2.getAuthInstance().signOut();
    },
  },
};

export default auth;
```

Our main Vuex store would look like this:

```js
// store/index.js
import { createStore } from 'vuex';
import auth from './auth';

const store = createStore({
  modules: {
    auth,
  },
});

export default store;
```

The next step would be creating a router for our application.

```js
// router.js
import { createRouter, createWebHistory } from 'vue-router';
import store from './store';

import Home from './components/Home.vue';
import Protected from './components/Protected.vue';

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/protected',
    component: Protected,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = store.state.auth.isLoggedIn;

  // Unauthenticated user can only access the home page.
  if (to.path != '/' && !isLoggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;
```

In the example above we have two routes: a home page (`/`) and a protected page (`/protected`). The home page can be accessed by everyone—including the authenticated user. On the other hand, the protected page can only be accessed by an authenticated user.

On the `beforeEach` hook we checked for the user's login status. If the user tries to visit a page other than the home page, we'll redirect them to the home page.

On the home page, we'll show a "Log In with Google" button if the user is not logged in.

```vue
<!-- src/components/Home.vue -->
<template>
  <div>
    <h1>Home</h1>
    <router-link v-if="isLoggedIn" to="/protected">
      Go to Protected Page
    </router-link>
    <button v-else @click="logIn">
      Log In with Google
    </button>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapState, mapActions } = createNamespacedHelpers('auth');

export default {
  computed: {
    ...mapState(['isLoggedIn']),
  },

  methods: {
    ...mapActions(['logIn']),
  },
};
</script>
```

While on the protected page, we'll show a button for logging-out.

```vue
<!-- src/components/Protected.vue -->
<template>
  <div>
    <h1>Protected</h1>
    <a @click="logOut">
      Log Out
    </a>
  </div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex';
const { mapActions } = createNamespacedHelpers('auth');

export default {
  methods: {
    ...mapActions(['logOut']),
  },
};
</script>
```

The main Vue component will have the `<router-view />` that will hold both pages:

```vue
<!-- src/components/App.vue -->
<template>
  <router-view />
</template>
```

Now, what's left is the main entry point for our Vue.js application.

```js
import { createApp } from 'vue';
import Auth from './Auth';
import store from './store';
import router from './router';

import App from './components/App.vue';

window.onGoogleApiLoad = async () => {
  const auth = new Auth({
    apiKey: process.env.VUE_APP_GOOGLE_API_KEY,
    clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  });

  try {
    await auth.init();

    // On user log out.
    auth.addEventListener('loggedIn', () => {
      store.commit('auth/logIn');
      router.push('/protected');
    });

    // On user log in.
    auth.addEventListener('loggedOut', () => {
      store.commit('auth/logOut');
      router.push('/');
    });

    // Load initial log in status.
    await store.dispatch('auth/loadInitialState');

    createApp(App)
      .use(store)
      .use(router)
      .mount('#app');
  } catch (error) {
    document.write(error.message);
  }
};
```

As you might have recalled, the `onGoogleApiLoad` is the function that will be invoked once the Google API client library is loaded. This function will initialize our `Auth` class wrapper.

We'll register an event listener both for `loggedIn` and `loggedOut` events. When the user just logged-in, we'll redirect them to the protected page. And when the user logs out, we'll redirect them back to the home page.

```js
auth.addEventListener('loggedIn', () => {
  store.commit('auth/logIn');
  router.push('/protected');
});

auth.addEventListener('loggedOut', () => {
  store.commit('auth/logOut');
  router.push('/');
});
```

We also dispatch the `loadInitialState` action to get the initial state of the user's login status.

```js
await store.dispatch('auth/loadInitialState');
```

Note that we reference both Google `apiKey` and the `clientId` using the environment variables. Using Vue CLI we can store this value on a `.env` file like so:

```bash
VUE_APP_GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
VUE_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```
