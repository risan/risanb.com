---
title: "Log: 2021 February"
date: 2021-02-17T21:19:00+07:00
categories: [log]
---
## 17 February 2021

### Automatically Resize the Image on Markdown Post on Hugo

I already implemented this feature back when [I switch to Hugo](/code/switching-to-hugo/) months ago. However, back then I used shortcode instead of a built-in markdown [image render hook](https://gohugo.io/getting-started/configuration-markup/#image-markdown-example). I tried the image render hook, but it threw an error. I never bother to found out why and stick with the shortcode.

Turns out, the error happened because I tried to process an image from the static directory within the image render hook. We can't get access to the image file within the static directory from a render hook. If you want to process an image from the static directory, use shortcode.

Now I have updated my `layouts/_default/_markup/render-image.html` to automatically resize any image larger than 1080px in width:

```html
<figure>
    <a href="{{ .Destination | safeURL }}">
        {{- $img := .Page.Resources.GetMatch .Destination -}}
        {{- if gt $img.Width 1080 -}}
            {{- $img = $img.Resize "1080x" -}}
        {{- end -}}
        <img src="{{ $img.Permalink | safeURL }}" {{- with .Text | plainify }} alt="{{ . }}"{{ end -}} {{- with .Title }} title="{{ . }}"{{ end -}}>
    </a>
    {{- with .Text | markdownify }}<figcaption>{{ . }}</figcaption>{{ end -}}
</figure>
```

### Host File on Windows 10

On Windows 10, the host file is located at:

```
C:\Windows\System32\drivers\etc\hosts
```

The format is the same as the one found on Linux or macOS. So unfortunately you cannot set a wildcard subdomain entry too.

```
102.54.94.97   foo.example.com      # Some comment
127.0.0.1      project.test 
127.0.0.1      secret.project.test
```

### Laravel Subdomain Routing

I know that Laravel has support for subdomain routing for a long time. It goes as early as version 4 in 2013—the first version of Laravel that I used. But I never really tried that feature, until today. It just works out-of-the-box. Of course, you still need to properly configure your webserver to point those subdomains to your Laravel's public directory. But it still blew my mind.

```php
Route::domain('{user}.example.com')->group(function () {
    Route::get('/messages/{id}', function ($user, $id) {
        // Get the {user} value through $user
    });
});
```