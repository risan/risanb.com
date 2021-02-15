---
title: "Axios: Handle Error Response with 200 Status Code"
date: 2020-02-23T20:19:00+07:00
lastmod: 2020-04-01T20:19:00+07:00
categories: [snippet]
tags: [javascript]
---
You might be using an API that does not utilize the HTTP status code properly. For example, even if the operation is failed because of the client error, the API returns a 200 status code—when in fact the 200 status code is meant for a successful response.

Let's say that the API uses the `status` field in the JSON body to indicate whether the operation is successful or not. When the `status` is `false`, the operation is failed, though the HTTP status code is 200. Of course, you can always inspect the returned JSON body before processing the response even further.

```js
const client = axios.create({
  baseURL: 'https://example.com',
});

// Suppose that the user with 12345 id does not exist and the response's body
// looks like this:
// {
//   status: false,
//   message: 'User not found.'
// }
client.get('/users/12345')
  .then(res => {
    if (res.status === false) {
      // Handle the error here...
    } else {
      // Handle the user data here...
    }
  });
```

However, I prefer to have an actual error instance when the operation is failed. To achieve this we can use axios [interceptors](https://github.com/axios/axios#interceptors) feature. Within the interceptor's callback we can throw an error when the `status` is `false`:

```js
const client = axios.create({
  baseURL: 'https://example.com',
});

client.interceptors.response.use(res => {
  if (res.data.status === false) {
    // Error message is retrived from the JSON body.
    const error = new Error(res.data.message);
    // Attach the response instance, in case we would like to access it.
    error.response = res;

    throw error;
  }

  // If the status is true, simply return back the response instance.
  return res;
});

client.get('/users/12345')
  .then(res => {
    // handle the user data here...
  })
  .catch(error => {
    // handle the error here...
  });
```

Note that in the example above we use a custom error message that is retrieved from the `message` field in the JSON body. We also attach the response instance to the error, in case we would like to access it within the catch block later.
