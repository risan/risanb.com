---
title: Fixing Blurry Image Scaling on CSS Hover Zoom
date: 2026-09-29T10:00:00+07:00
description: Why browsers blur scaling images during CSS transform transitions, and how to fix it with isolated 3D GPU layer promotion.
categories: [snippet]
tags: [css]
images: [/posts/fixing-blurry-image-scaling-on-css-hover-zoom/og.png]
---
Have you ever added a subtle zoom effect on image hover (`transform: scale(1.05)` with `transition: transform ...`) only to notice a weird rendering artifact? The image is razor-sharp at rest. But during the scaling transition, it turns fuzzy and blurry, then suddenly snaps back to crystal-sharp once the animation stops.

Here is why that happens in modern browser engines (Chromium, WebKit, Gecko) and how to fix it cleanly.

## Why Browsers Blur Scaling Images

When an element animates with `transform: scale()`, browsers optimize the transition by offloading it to the GPU:

1. **Pre-rasterized GPU textures**: The browser takes a snapshot of the image at its unscaled $1\times$ size and caches it as a GPU texture quad.
2. **Bilinear texture interpolation**: While the transition runs at 60fps, the GPU stretches that static bitmap texture using bilinear filtering instead of re-rasterizing the original image on every frame. Stretching a $1\times$ bitmap texture causes subpixel blurring mid-flight.
3. **Re-rasterization on completion**: When the transition stops, the browser realizes the element is stationary, re-rasterizes it at the new pixel boundary, and anti-aliases it—causing the sudden snap back to sharpness.

The problem is compounded if you scale an outer container that has `overflow: hidden` and `border-radius`: Chromium forces the clipped figure into an offscreen mask buffer. Stretching that mask buffer stretches both the image and the anti-aliased border radius together.

## The Solution

To achieve smooth, razor-sharp zoom without mid-animation blur, follow three rules:

### 1. Scale Only the Image, Never the Clipped Container

Keep the parent card or frame completely static. The container provides the `overflow: hidden` and `border-radius` mask on the physical pixel grid without ever being stretched. Only scale the inner `<img>`.

### 2. Promote the Image to a 3D Compositing Layer

Initialize the image with `transform: translate3d(0, 0, 0) scale(1)`, `will-change: transform;`, and `backface-visibility: hidden;`. This instructs the compositor to allocate a dedicated hardware layer ahead of time, avoiding layer-creation jank and subpixel snapping.

### 3. Ensure Sufficient Source Pixel Density

If your responsive image (`srcset` / `sizes`) delivers an image that only matches the container's exact display width, scaling up by 5% forces the GPU to invent pixels. Ensure your `sizes` attribute or image asset provides a comfortable 1.5× to 2× density headroom (e.g. for high-DPI and Retina screens).

## The CSS Snippet

```css
/* 1. The container stays static on the pixel grid */
.image-card {
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  /* Optional: elevate shadow on hover without moving geometry */
  transition: box-shadow 0.3s ease;
}

.image-card:hover {
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
}

/* 2. The image uses hardware-accelerated 3D transform */
.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: translate3d(0, 0, 0) scale(1);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
}

/* 3. Scale only the inner image on hover */
.image-card:hover img {
  transform: translate3d(0, 0, 0) scale(1.05);
}
```

With this pattern, the outer frame mask stays locked to physical screen pixels, while the inner image zooms smoothly with ample source pixel density—remaining razor-sharp before, during, and after the hover transition.
