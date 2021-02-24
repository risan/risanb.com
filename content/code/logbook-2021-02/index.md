---
title: "Logbook: 2021 February"
date: 2021-02-17T21:19:00+07:00
lastmod: 2021-02-24T21:54:00+07:00
categories: [log]
tags: [logbook]
---
### Install PHP 8 on Windows

Today I managed to install the latest PHP version 8 on my Windows machine. It's a pretty straightforward process:

* Download the binary from [windows.php.net/download](https://windows.php.net/download/). I use the *Thread Safe* version to pair it with Nginx. If you PHP as a FastCGI on IIS, choose the *Non Thread Safe* version.
* I use [Laragon](https://laragon.org/), so I just have to extract the downloaded file into Laragon's PHP directory (default to `C:\laragon\bin\php`).
* The latest PHP version 8 requires [Visual C++ redistributable packages for Visual Studio 2019](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0). Once it's installed, you'll probably need to restart the computer.
* If you want to use PHP 8 with SQL Server, you will also need to download the PHP driver for SQL Server. You will need at least a [PHP driver for SQL Server version 5.9.0](https://github.com/microsoft/msphpsql/releases/tag/v5.9.0). 
* Extract the downloaded file and place the required DLLs on the `/ext` directory within your PHP installation. Note that the DLLs have both the *Thread Safe* and *Non Thread Safe* version, choose the appropriate version for your PHP installation.
* Now all you have to do is to enable the DLLs through the `php.ini` file.

<hr>

<time datetime=" 2021-02-18T21:04:00Z07:00">18 February 2021</time>

### List Pages with Specific Tag on Hugo

We can combine the `range` and the `where` functions on Hugo to get a list of pages with some specific tag. Let say we want to get the first 5 recent pages that contain the `logbook` tag, we can achieve it like this:

```html
<ul>
    {{- range first 5 (where .Site.RegularPages "Params.tags" "intersect" (slice "logbook")) -}}
    <li>
        <a href="{{ .RelPermalink }}">{{ .Title }}</a>
    </li>
    {{- end -}}
</ul>
```

The `intersect` operator accepts an array, that's why we need to turn the `logbook` into an array first.

### Postmark Custom Metadata on Laravel

Postmarks support [custom metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq) to be sent along with the outbound message. You can do so by adding a custom HTTP header named `X-PM-Metadata-SOMETHING`. On [Laravel mailable](https://laravel.com/docs/8.x/mail#generating-mailables), you can set this header by accessing the underlying `Swift_Message` instance through the `withSwiftMessage` function. I create a `PostmarkMailable` class that extends the Laravel `Mailable` class.

```php
<?php

namespace App\Mail;

use Swift_Message;
use Illuminate\Mail\Mailable as BaseMailable;

abstract class PostmarkMailable extends BaseMailable
{
    // Omitted...

    public function metadata($key, $value = null)
    {
        if (is_array($key)) {
            foreach ($key as $k => $v) {
                $this->metadata($k, $v);
            }

            return $this;
        }

        $this->withSwiftMessage(function (Swift_Message $message) use ($key, $value) {
            $message->getHeaders()->addTextHeader("X-PM-Metadata-{$key}", $value);
        });

        return $this;
    }
}
```

Now, when we send a mailable that extends this `PostmarkMailable` class, we can also the metadata.

```php
// Some mailable that extends the PostmarkMailable
$mailable = new \App\Mail\OrderShipped();

// Set a single metadata
$mailable->metadata('order-id', 12345);

// Or multiple metadata at once
$mailable->metadata([
    'order-id' => 12345,
    'customer-name' => 'Luke Skywalker',
]);
```

Currently, you can only set up to 10 metadata. The field name is also limited to 20 characters, while the value is restricted to 80 characters.

<hr>

<time datetime="2021-02-17T21:19:00Z07:00">17 February 2021</time>

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