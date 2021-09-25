---
title: List Pages with Specific Tag on Hugo
date: 2021-02-18T21:14:00+07:00
categories: [snippet]
tags: [hugo]
images: [/img/hugo.png]
---
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