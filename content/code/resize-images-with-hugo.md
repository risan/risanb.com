---
title: Resize Images on Markdown Post with Hugo
date: 2021-02-17T21:19:20+07:00
categories: [snippet]
tags: [hugo]
images: [/img/hugo.png]
---
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