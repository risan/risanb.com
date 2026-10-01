---
title: Fixing Blurry Images on Hover Zoom
date: 2026-09-29T10:00:00+07:00
description: What to check when an image looks blurry during a CSS hover zoom.
categories: [snippet]
tags: [css]
images: [/posts/fixing-blurry-image-scaling-on-css-hover-zoom/og.png]
---

I added a slight zoom to an image on hover. It looked sharp before the animation and sharp again when it stopped, but blurry for the half-second in between.

The browser can animate `transform: scale()` by enlarging pixels it has already drawn. That’s fast, though the image may look softer while it moves. Scaling a small image makes the effect easier to spot.

What helped was keeping the card still and scaling only the image inside it:

```css
.image-card {
  overflow: hidden;
  border-radius: 4px;
}

.image-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.45s ease;
}

.image-card:hover img {
  transform: scale(1.05);
}

@media (prefers-reduced-motion: reduce) {
  .image-card img {
    transition: none;
  }
}
```

The card keeps its rounded corners in place while the image moves behind them. I’d also check the image file: if it barely has enough pixels to fill the card, zooming it will stretch those pixels further. With responsive images, make sure `srcset` offers a large enough file and `sizes` reflects the card’s actual width.

You’ll sometimes see `translate3d(0, 0, 0)` or `will-change: transform` recommended for this. They can change how a browser handles the animation, but they aren’t a reliable sharpness switch. I’d try the simpler version first and only add either one if it visibly helps in the browser where you’re seeing the blur.
