---
title: Loading a Cloudflare Access App in an iframe
date: 2026-10-05T22:00:00+07:00
description: Cloudflare Access refuses to show its login page inside an iframe. Here's the tiny Worker I used to move the login into a popup, so the iframe works anyway.
categories: [log]
tags: [cloudflare, javascript, devops]
images: [/posts/loading-a-cloudflare-access-app-in-an-iframe/og.png]
---
A few days ago, I added an "Apps" menu to the internal dashboard we use at work. The idea is simple: pick an app from the sidebar, and it opens in a full-size iframe right inside the dashboard. No more twenty browser tabs. I tested it with Wikipedia, it worked, and I felt very productive.

Then I added the first real app: a small internal report site. Since it holds company data, it sits behind [Cloudflare Access](https://developers.cloudflare.com/cloudflare-one/policies/access/), Cloudflare's login wall for internal tools. I clicked the menu item and got... a grey box with a sad face. The browser console said this:

```text
Framing 'https://my-team.cloudflareaccess.com/' violates the following
Content Security Policy directive: "frame-ancestors 'none'".
The request has been blocked.
```

Okay. Cloudflare said no.

{{<toc>}}

## Why Cloudflare says no

When you open an Access-protected site and you're not logged in yet, Cloudflare redirects you to its login page at `<your-team>.cloudflareaccess.com`. That login page comes with two headers:

```http
Content-Security-Policy: frame-ancestors 'none'
X-Frame-Options: DENY
```

Both say the same thing: "nobody is allowed to put me inside an iframe." This is on purpose. A login page inside an iframe is a classic trick for [clickjacking](https://owasp.org/www-community/attacks/Clickjacking): a shady site frames a real login page, puts something invisible on top, and tricks you into clicking or typing where you shouldn't. So Cloudflare locks its login page down, and there's no setting to turn that off. I checked. Twice.

The obvious fix is to open apps like this in a new tab instead of the iframe. Except we were in a **code freeze**. No changes to the dashboard code, no changes to our APIs. Even my AI pair programmer suggested the "new tab" button and then politely reminded me that I wasn't allowed to write it. Thanks.

So the question became: can I make this work with only Cloudflare settings and things that live outside our codebase?

## Clue #1: it works if you're already logged in

While poking around, I noticed something. If I opened the report site in a normal tab first and logged in there, then went back to the dashboard, the iframe loaded just fine.

That makes sense. Cloudflare only shows the login page when you *don't* have a valid session. After you log in, Access drops a cookie called `CF_Authorization` on the app's domain. With that cookie, Access skips the login page and serves the app directly, and the app itself is happy to live in an iframe.

There's one catch. Inside the iframe, that cookie is a *third-party* cookie, because the iframe's domain is different from the dashboard's domain. Browsers don't send third-party cookies by default unless the cookie says `SameSite=None`. Luckily, Access lets you set that per application:

**Zero Trust → Access → Applications → your app → Additional settings → Cookie settings → Same Site Attribute → None**

With that, "log in first, then use the iframe" worked every time. But "please open this other URL in a new tab and log in first" is not a great experience. I wanted the iframe to handle it.

## Clue #2: the login only needs to happen *somewhere else*

Cloudflare blocks its login page inside an iframe. It doesn't care about popups. A popup is a normal top-level browser window, so the login page loads there without any complaints.

And a popup shares cookies with the rest of the browser. So if the user logs in through a popup, the `CF_Authorization` cookie lands on the app's domain, and the iframe can use it right after.

So the plan:

1. The iframe doesn't load the app directly. It loads a tiny public "gate" page on the app's own domain.
2. The gate checks whether the user already has a session. If yes, it goes straight to the app.
3. If not, it shows a **Sign in** button. The button opens a popup to a protected page, so Cloudflare asks the user to log in there.
4. After the login, the popup closes itself. The gate notices the new session and loads the app inside the iframe.

The user clicks one button and logs in once. No new tabs to remember, no code change in the dashboard.

## The gate Worker

The gate is a [Cloudflare Worker](https://developers.cloudflare.com/workers/) that serves two tiny HTML pages:

- `/embed-gate`: the public page with the Sign in button. This one must load without a login.
- `/embed-done`: the page the popup opens. This one stays behind Access, so opening it forces the login. All it does after that is close the popup.

Here's the whole thing:

```javascript
const GATE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sign in</title>
</head>
<body>
<main>
  <p id="status">Checking your session…</p>
  <button id="sign-in" hidden>Sign in</button>
</main>
<script>
  const requested = new URLSearchParams(location.search).get('next') || '/';
  const next = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/';
  const status = document.getElementById('status');
  const button = document.getElementById('sign-in');

  async function isSignedIn() {
    const response = await fetch(next, { credentials: 'include', redirect: 'manual', cache: 'no-store' });

    return response.ok;
  }

  function waitForSignIn() {
    const timer = setInterval(async () => {
      if (await isSignedIn()) {
        clearInterval(timer);
        location.replace(next);
      }
    }, 2000);
  }

  button.addEventListener('click', () => {
    window.open('/embed-done', 'embed-sign-in', 'width=520,height=720');
    status.textContent = 'Finish signing in in the new window. This page continues on its own.';
    button.hidden = true;
    waitForSignIn();
  });

  isSignedIn().then((signedIn) => {
    if (signedIn) {
      location.replace(next);

      return;
    }

    status.textContent = 'You need to sign in before this app can open here.';
    button.hidden = false;
  });
</script>
</body>
</html>`;

const DONE_HTML = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Signed in</title></head>
<body>
<p>You are signed in. You can close this window.</p>
<script>window.close();</script>
</body>
</html>`;

function html(body) {
  return new Response(body, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname === '/embed-done') {
      return html(DONE_HTML);
    }

    return html(GATE_HTML);
  },
};
```

(The real one has a bit of CSS so the button doesn't look like it's from 1998. I left it out here.)

A few things worth pointing out:

- **How it checks the session.** `isSignedIn()` fetches the app with `redirect: 'manual'`. If the user is logged in, the app answers `200` and `response.ok` is `true`. If not, Access answers with a redirect to the login page. With `redirect: 'manual'`, the browser doesn't follow it and hands back an "opaque redirect" response, where `ok` is always `false`. So no login page ever loads inside the iframe, not even in the background.
- **Why it lives on the app's own domain.** The gate runs on the same domain as the app, so that `fetch` is a same-origin request, and it sends the `CF_Authorization` cookie along. If the gate lived on some other domain, it couldn't see the app's session at all.
- **Waiting for the popup.** The gate doesn't talk to the popup at all. The popup bounces through the Cloudflare login page and maybe your identity provider, and I didn't want to depend on any of that. So the gate simply checks the session every two seconds until it shows up. It's boring, and it works.
- **The `next` check** only accepts paths like `/reports`, never a full URL. Otherwise anyone could use the gate to send people to some other site.

## Wiring it up

Everything here happens in the Cloudflare dashboard, with no change to the app or to the dashboard that embeds it.

1. **Deploy the Worker** and add two routes on the app's hostname, so the Worker answers only these two paths and the app keeps everything else:

   ```text
   app.example.com/embed-gate*
   app.example.com/embed-done*
   ```

2. **Make the gate public.** In Zero Trust, add a new self-hosted Access application for `app.example.com` with the path `embed-gate`, and give it a policy with the action **Bypass** for **Everyone**. Access picks the most specific path, so only the gate becomes public. `/embed-done` and the rest of the app stay protected.

3. **Set the cookie to `SameSite=None`** on the app's own Access application, as described above. Without it, the iframe never receives the session.

4. **Point the iframe at the gate**, `https://app.example.com/embed-gate`, instead of at the app.

To test it, log out with `https://app.example.com/cdn-cgi/access/logout`, then open the app from the dashboard. You should see the Sign in button, then the popup, then the app inside the iframe. The first time it worked, I may have made a small happy noise at my desk.

The nice part: the gate doesn't know anything about the app behind it. When the next internal tool needs to go into the iframe, I add two routes and one more hostname to the same Bypass application, flip its cookie to `SameSite=None`, and that's it.

## The fine print

This isn't magic, so here's where it breaks:

- **Safari and Chrome Incognito** block third-party cookies, `SameSite=None` or not. There, the iframe never receives the session and the gate keeps asking you to sign in. If you need those browsers, put the app on a subdomain of the dashboard's domain. Then the cookie isn't third-party anymore.
- **Apps on a Worker custom domain.** If the app itself is a Worker with a custom domain, the custom domain wins over the routes, so the gate never runs. You'd have to add the two pages to that Worker instead.
- **The `next` page must answer `200`.** If the app's home page redirects somewhere, say `/` to `/dashboard`, the gate thinks you're logged out. Point `?next=` at a page that answers directly.
- **The iframe must allow popups.** A plain `<iframe>` does. If yours has a `sandbox` attribute, it needs `allow-popups` (and `allow-scripts`, `allow-same-origin`).
- **Sessions still expire.** When the Access session runs out, the user sees the Sign in button again. You can make that rarer by raising the session duration on the Access policy.

Honestly, the cleanest fix is still an "open in new tab" option in the dashboard, and I'll probably add it once the freeze is over. But I like this one. It's one small Worker, it touches no app code, and it turned "Cloudflare says no" into "Cloudflare says sure, just sign in over here first."
