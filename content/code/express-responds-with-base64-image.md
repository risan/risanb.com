---
title: Express Responds with Base64 Encoded Image
date: 2018-12-04T10:16:00+02:00
description: Using Express to send response with base64 encoded image.
categories: [snippet]
tags: [javascript, node]
images: [/img/express.png]
---
I want to create an endpoint that will respond with a 1x1 pixel PNG file. Instead of using the [`sendFile`](https://expressjs.com/en/4x/api.html#res.sendFile) method, I choose to use the base64 encoded representation since the file size is super small. This way I can avoid accessing the file system entirely.

Here's the gist:

```js
const express = require("express");

const app = express();

app.get("/test.png", (req, res) => {
  // A 1x1 pixel red colored PNG file.
  const img = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==", "base64");

  res.send(img);
});
```

Note that when you pass a `Buffer`, the `content-type` header will be set to `application/octet-stream`.
