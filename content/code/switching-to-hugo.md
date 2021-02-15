---
title: Switching to Hugo
date: 2020-05-10T21:27:00+07:00
categories: [log]
tags: [hugo]
images: [/img/hugo.png]
---
Another day, another static site generator to switch to. The curse is real. Instead of writing more blog posts, I ended up messing up with the platform. It was once powered by [Jekyll](/code/new-blog/). It was once using a [custom static site generator](/code/i-create-my-own-static-site-generator/) that I wrote myself. It was once built on top of [Gatsby](https://github.com/risan/risanb.com/tree/gatsby). And now I'm switching to [Hugo](https://gohugo.io/)—the world's fastest static site generator. And I'm very happy with it.

Gatsby is great. Although it was a bit awkward at first, the GraphQL is so powerful. It's more flexible for us to query and transform our data. It has tons of plugins ready to use. I really like their Sharp plugin that can be used for resizing and optimizing images—which are done through the comfort of a GraphQL query. Or the `gatsby-remark-images` that can automatically generate a traced-SVG that acts as a placeholder for all of our images.

However, there are several things in Gatsby that make me looking for yet another static site generator. First, the fact that I still have to write some code to transform my markdown files into an HTML page. Secondly, I have to deal with tons of NPM dependencies: plugin for transforming markdown, for generating sitemap and RSS feed, for image processing, even a plugin for controlling the document head.

Another thing that bothers me is that the generated HTML page will still load so many JS files: the React framework itself, the component data, the page manifest, and other Webpack artifacts. Every time you hover into a link of another page, behind the scene Gatsby will pull some data of that page. Making it so smooth to navigate between pages. But that's now what I want. I just want a pure static HTML page and some CSS. Though I'm quite surprised that the generated HTML page will still work even when the JavaScript is disabled.

On the other hand, with Hugo, it just works. You don't even have to understand Go. You can just pull some theme and start blogging. You put your markdown file in `/content/foo/bar.md`, you'll have an HTML page at `/foo/bar/`. Sitemap and RSS are generated automatically. Tags and categories are working out of the box. Do you need Google Analytics, OpenGraph meta tags, or Disqus integration? There's a built-in template for it. You can minify your CSS, you can use SASS, even optimizing your images without installing any extra dependencies.

And to top it all off, it's blazingly fast. For this blog, Hugo takes 24 seconds to generate 270 pages and process 155 images. And when using its cache, Hugo can build this site in less than 1 second!

With all these great features, I guess now I don't have any excuses to toy around with the platform again and start writing some blog posts.

Anyway, here are some interesting code snippets and things I learned from building this new blog:

{{<toc>}}

## You Only Need 3 Template Files

If you're crafting your own theme, you'll only need to create 3 template files:

1. `layouts/_default/single.html`: for your posts and pages.
2. `layouts/_default/list.html`: for the pages that will list your pages, including your category and tag pages.
3. `layout/index.html`: for your homepage.

## The Base Template

There's also the `layouts/_default/baseof.html` that acts as the base template. For example, if you have a `baseof.html` template like this:

```go-html-template
<html>
<head>
  <title>{{ .Title }}</title>
</head>
<body>
  {{ block "main" . }}{{ end }}
</body>
</html>
```

You can then extend the `main` block within your other templates like so:

```go-html-template
{{ define "main" }}
  <h1>Foo Bar</h1>
{{ end }}
```

## OpenGraph and Twitter Card Meta Tags

To add OpenGraph and Twitter Card meta tags, all we have to do is to include the built-in internal template:

```go-html-template
<html>
<head>
  <title>{{ .Title }}</title>
  {{ template "_internal/opengraph.html" . }}
  {{ template "_internal/twitter_cards.html" . }}
</head>
<body>
  {{ block "main" . }}{{ end }}
</body>
</html>
```

We can configure the title, the description, or the image from within the frontmatter of our post or page. Note that the `images` field is an array, so it can accept multiple image URLs.

```md
---
title: Your Title
date: 2020-01-31T12:00:00+07:00
description: Your Description
images: [/img/image-cover.jpg]
---
```

We can also set a fallback value for these fields through the global config file:

```yaml
title: Your Title
params:
  description: Your Description
  images: [/img/image-cover.jpg]
```

## Add RSS Link Tag

To print RSS link tag within the `<head>`, we can do something like this in our the `baseof.html` template:

```go-html-template
<html>
<head>
  ...
  {{- with .OutputFormats.Get "RSS" }}
    <link rel="alternate" type="application/rss+xml" href="{{ .RelPermalink }}" title="{{ $.Site.Title }}">
  {{- end }}
</head>
</html>
```

## Working with CSS

With Hugo, you can use SASS, SCSS, even PostCSS without installing any extra dependencies. However, I'm trying to avoid these tools and just go straight with a plain old CSS. You can easily combine, minify, and add versioning to your CSS bundle; all from within the template file.

```go-html-template
<html>
<head>
  ...
  {{- $minireset := resources.Get "minireset.css" -}}
  {{- $wysiwyg := resources.Get "wysiwyg.css" -}}
  {{- $main := resources.Get "main.css" -}}
  {{- $styles := slice $minireset $wysiwyg $main | resources.Concat "styles.css" | minify | fingerprint -}}
  <link rel="stylesheet" href="{{ $styles.Permalink }}">
</head>
</html>
```

In the above example, we combine the `minireset.css`, `wysiwyg.css`, and `main.css` files into `styles.css`. We then minify this bundle and add versioning through the `fingerprint` function. Note that the CSS files are relative to the `assets` directory.

## Adding Caption to Image

In Gatsby, besides generating traced-SVG images, I usually use the [`gatsby-remark-images`](https://www.gatsbyjs.org/packages/gatsby-remark-images/) plugin to also add a caption to an image based on its `title` or `alt` attribute. In Hugo, we simply create a custom template to render these images. This custom template must be saved in `/layouts/_default/_markup/render-image.html`:

```go-html-template
<figure>
  <a href="{{ .Destination | safeURL }}">
    <img src="{{ .Destination | safeURL }}" {{- with .Text | plainify }}alt="{{ . }}"{{- end }}>
  </a>
  {{- with .Text | markdownify }}<figcaption>{{ . }}</figcaption>{{- end }}
</figure>
```

Note that we call the `markdownify` function for the caption. So we can still use markdown for writing our caption: make it bold, italic, or add a link.

## Group Post by Year

As you might have noticed on [`/code`](/code/) and [`/blog`](/blog/) sections, I group the posts on those sections by year. To do that our `list.html` file should look like this:

```go-html-template
{{ define "main" }}
  {{ range .Pages.GroupByDate "2006" }}
    <h3>{{ .Key }}</h3>
    <ul>
      {{ range .Pages }}
        <li>
          <a href="{{ .Permalink }}">
            {{ .Title }}
          </a>
        </li>
      {{ end }}
    </ul>
  {{ end }}
{{ end }}
```

## Adding Table of Contents

To add a table of contents, we simply need to print the `.TableOfContents` variable. We can print it within our `single.html` template.

```go-html-template
{{ define "main" }}
  <article>
    <header>
      <h1>{{ .Title }}</h1>
    </header>
    {{ .TableOfContents }}
    {{ .Content }}
  </article>
{{ end }}
```

Or we can also create a shortcode for this table of contents.

```go-html-template
<h2>Table of Contents</h2>
{{ .Page.TableOfContents }}
```

This way the position of our table of contents can be more flexible. If we put that shortcode in `/layouts/shortcodes/toc.html`, we can use it in the middle of our markdown post like so:

```md
## Heading 1
Lorem ipsum dolor.

{{</*toc*/>}}

## Heading 2
Lorem ipsum dolor.
```

## Resizing and Optimizing Image

To resize and optimize our images, we can create a shortcode for our image:

```go-html-template
{{- $img := .Page.Resources.GetMatch (.Get "src") -}}
{{- $resize := $img.Resize "1000x 80q" -}}
<img src="{{ $resize.Permalink }}" {{- with .Get "alt"}}alt="{{ . }}"{{- end }}>
```

The above shortcode will resize the given image to 1000px in width with 80% image quality. If we save that shortcode in `/layouts/shortcodes/img`, we can then use it within the markdown file like so:

```xml
{{</*img src="orange.jpg" alt="Some Orange"*/>}}
```

I went even further by adding a caption and resizing the image only if it's wider than 1000px:

```go-html-template
{{- $img := .Page.Resources.GetMatch (.Get "src") -}}
<figure>
  <a href="{{ $img.Permalink }}">
  {{- if gt $img.Width 1000 -}}
    {{- $resize := $img.Resize "1000x" -}}
    <img src="{{ $resize.Permalink }}" {{- with .Get "alt"}}alt="{{ . | plainify }}"{{- end }}>
  {{- else -}}
    <img src="{{ $img.Permalink }}" {{- with .Get "alt"}}alt="{{ . | plainify }}"{{- end }}>
  {{- end -}}
  </a>
  {{- with .Get "alt" }}<figcaption>{{ . | markdownify }}</figcaption>{{- end }}
</figure>
```

Also, note that I don't pass the image quality parameter since I configure this value directly within the global site config.

```yaml
imaging:
  quality: 80
```

## Commit the Cache Directory

Hugo is super fast. But still, if you have tons of images to process, it could take some time to build. To speed up this build process, we could commit the generated cache directory in `/resources/_gen` into our git repository. So every time we build our site, if the images or any other assets are already processed before, Hugo will restore them from its cache rather than processing them again from scratch. When building the site, you can pass the `--gc` flag to remove unused cache files.

```sh
$ hugo --gc
```
