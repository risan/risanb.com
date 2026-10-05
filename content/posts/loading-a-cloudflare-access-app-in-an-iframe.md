---
title: Loading a Cloudflare Access App in an iframe
date: 2026-10-05T22:00:00+07:00
description: Cloudflare Access won't show its login page inside an iframe. A tiny Worker moves the login into a popup, so the iframe works anyway.
categories: [log]
tags: [cloudflare, javascript, devops]
images: [/posts/loading-a-cloudflare-access-app-in-an-iframe/og.png]
---
Our internal dashboard at work has an "Apps" menu that opens other internal tools in an iframe. One of those tools sits behind [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/), and it wouldn't load:

```text
Framing 'https://my-team.cloudflareaccess.com/' violates the following
Content Security Policy directive: "frame-ancestors 'none'".
```

## Why it fails

When you're not logged in, Access redirects you to its login page. That page sends `frame-ancestors 'none'` and `X-Frame-Options: DENY`, so it can never load inside an iframe. It's a protection against [clickjacking](https://owasp.org/www-community/attacks/Clickjacking), and no setting turns it off.

But if you're already logged in, Access skips the login page and the app loads fine in the iframe. So the only problem is the first login.

## The fix: log in through a popup

The login page can't load in an iframe, but it loads fine in a popup. And a popup shares cookies with the iframe. So:

1. The iframe loads a small public "gate" page on the app's domain.
2. If the user already has a session, the gate goes straight to the app.
3. If not, the gate shows a **Sign in** button that opens a popup. The user logs in there, and the popup closes itself.
4. The gate sees the new session and loads the app.

## The gate Worker

A [Cloudflare Worker](https://developers.cloudflare.com/workers/) serves two pages on the app's domain:

- `/embed-gate`: public. It holds the Sign in button and the script below.
- `/embed-done`: still behind Access, so opening it in the popup forces the login. Its only job is `<script>window.close();</script>`.

Here's the gate page's script:

```javascript
const next = '/';
const button = document.getElementById('sign-in');

async function isSignedIn() {
  const response = await fetch(next, { credentials: 'include', redirect: 'manual' });

  return response.ok;
}

button.addEventListener('click', () => {
  window.open('/embed-done', 'sign-in', 'width=520,height=720');

  const timer = setInterval(async () => {
    if (await isSignedIn()) {
      clearInterval(timer);
      location.replace(next);
    }
  }, 2000);
});

isSignedIn().then((signedIn) => {
  if (signedIn) {
    location.replace(next);
  } else {
    button.hidden = false;
  }
});
```

`redirect: 'manual'` is the trick. When the user isn't logged in, Access answers with a redirect to the login page. The browser doesn't follow it, and `response.ok` is `false`. So the login page never loads inside the iframe. And since the gate runs on the app's own domain, the `fetch` sends the Access cookie along.

## Setting it up

1. Deploy the Worker and add two routes on the app's hostname: `app.example.com/embed-gate*` and `app.example.com/embed-done*`.
2. In Zero Trust, add a self-hosted Access application for `app.example.com/embed-gate` with a **Bypass** policy for **Everyone**. Only the gate becomes public; the rest of the app stays protected.
3. On the app's own Access application, set **Cookie settings → Same Site Attribute** to **None**. Otherwise the iframe never gets the session cookie.
4. Point the iframe at `https://app.example.com/embed-gate`.

The gate doesn't know anything about the app, so the same Worker works for the next app too: add two routes and one more hostname to the Bypass application.

## Limits

- Safari and Chrome Incognito block third-party cookies, so the iframe never gets the session there.
- If the app is a Worker on a custom domain, the custom domain wins over the routes and the gate never runs.
- A sandboxed iframe needs `allow-popups`.
