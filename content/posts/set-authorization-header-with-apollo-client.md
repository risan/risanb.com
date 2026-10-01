---
title: Set Authorization Header with Apollo Client
date: 2018-04-14T13:00:00+02:00
categories: [snippet]
tags: [javascript, graphql]
images: [/img/apollo.png]
---
A GraphQL API often requires us to provide an authorization header to authenticate the request. How can we provide this authorization header using the popular [Apollo Client](https://www.apollographql.com/client) library?

It turns our Apollo already provides us with the [apollo-link](https://www.apollographql.com/docs/link/) module. apollo-link is a composable network layer that we can use to configure the HTTP request. With apollo-link, we can create chainable middlewares that will construct our final HTTP request.

Suppose our initial code to instantiate an Apollo Client look like this:

```js
import { ApolloClient, InMemoryCache, HttpLink } from 'apollo-boost';

const httpLink = new HttpLink({ uri: 'https://api.example.com/graphql' });

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});
```

Let's say we store our authorization token on a local storage. To set the authorization header, we need to create an instance of `ApolloLink` and combine it with the current `HttpLink` instance.

```js
import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from 'apollo-boost';

const httpLink = new HttpLink({ uri: 'https://api.example.com/graphql' });

const authLink = new ApolloLink((operation, forward) => {
  // Retrieve the authorization token from local storage.
  const token = localStorage.getItem('auth_token');

  // Use the setContext method to set the HTTP headers.
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : ''
    }
  });

  // Call the next link in the middleware chain.
  return forward(operation);
});

const client = new ApolloClient({
  link: authLink.concat(httpLink), // Chain it with the HttpLink
  cache: new InMemoryCache()
});
```

The `ApolloLink` accepts exacly one parameter: the "Request Handler" function. This request handler function accepts two parameters: `operation` and `forward`. We can use the `operation.setContext` method to set any HTTP headers. We then call the given `forward` function to execute the next middleware in chain.
