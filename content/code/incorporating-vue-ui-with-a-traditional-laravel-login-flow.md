---
title: Incorporating Vue UI with a Traditional Laravel Login Flow
date: 2020-03-22T21:21:00+07:00
tags: [javascript, laravel, vue]
categories: [snippet]
description: A simple trick to incorporate Vue-based UI with a traditional session-based Laravel login flow.
---
Let's say we want to create a traditional login flow using the Laravel framework. The users will enter their username and password and our system will send an HTTP POST request to authenticate that credentials. And at the same time, instead of using a traditional HTML form, we want to use a Vue component for building the form UI.

In my case, I also use the VeeValidate library for validating on the frontend side. Here's how the Vue component might looks:

```html
<template>
  <ValidationObserver
    ref="observer"
    v-slot="{ handleSubmit }"
  >
    <form
      ref="form"
      :action="'/login'"
      method="POST"
      @submit.prevent="handleSubmit(submit)"
    >
      <input
        name="_token"
        type="hidden"
        :value="token"
      >

      <ValidationProvider
        v-slot="{ errors }"
        name="email"
        rules="required|email"
      >
        <input
          v-model="email"
          :error-messages="errors"
          label="Email"
          name="email"
          type="text"
        />
      </ValidationProvider>

      <ValidationProvider
        v-slot="{ errors }"
        name="password"
        rules="required"
      >
        <input
          v-model="password"
          :error-messages="errors"
          label="Password"
          name="password"
          type="password"
        />
      </ValidationProvider>

      <button type="submit">
        Login
      </button>
    </form>
  </ValidationObserver>
</template>

<script>
  export default {
    data() {
      return {
        token: '',
        email: '',
        password: '',
      };
    },

    mounted() {
      //
    },

    methods: {
      submit() {
        this.$refs.form.submit();
      },
    },
  };
</script>
```

It's pretty straight forward. There are three inputs: `_token`, `email`, and `password`. The `_token` will hold the CSRF token that needs to be sent along with the POST request. `email` and `password` are the credentials that will be used to authenticate the user.

Since it's a session-based login, we need to incorporate the Laravel validation error into our Vue component. On our Blade template, we need to pass these errors into a JS variable so our Vue component can consume it.

```html
<html>
<head>
  ...
  <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
  ...
  <script>
    window.errors = @json($errors->toArray());
    window.oldInputs = {
      email: '{{ old("email") }}'
    };
  </script>
</body>
</html>
```

In the template above, we store the CSRF token on a `<meta>` tag. We also store any error data from Laravel into a global JS variable named `errors`. Last we store the old email input into a JS variable named `oldInputs`, so if the login failed, user can still see their previously entered email. Now, all we have to do is incorporate these data into our Vue component:

```js
export default {
  data() {
    return {
      token: document.querySelector('[name=csrf-token]')
        .getAttribute('content'),
      email: window.oldInputs.email,
      password: '',
    };
  },

  mounted() {
    this.$refs.observer.setErrors(window.errors);
  },

  methods: {
    submit() {
      this.$refs.form.submit();
    },
  },
};
```
