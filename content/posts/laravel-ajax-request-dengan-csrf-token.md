---
languageCode: id
title: Laravel AJAX Request dengan CSRF Token
date: 2014-01-27T20:00:00+07:00
categories: [snippet]
tags: [php, laravel]
---
Jika Anda menggunakan Laravel dan mengkombinasikan teknik AJAX untuk mengirim request ke server, pasti Anda pernah memikirkan: bagaimana caranya memproteksi *endpoint* AJAX tersebut dari serangan CSRF?

## AJAX Form

Sebagai contoh, kita memiliki sebuah laman untuk mengirimkan pesan ke server dengan teknik AJAX:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Ajax Form</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
  </head>
  <body>
    <input type="text" id="message">
    <button type="button" id="send">Send</button>

    <script src="//code.jquery.com/jquery-1.10.2.min.js"></script>
    <script src="{{ asset('ajax-setup.js') }}"></script>
    <script src="{{ asset('ajax-handler.js') }}"></script>
  </body>
</html>
```

## Setup AJAX Request

Pada kode di atas, kita tidak menyisipkan `csrf_token` di dalam *hidden input* seperti biasanya; melainkan pada `meta` tag dengan nama `csrf-token`. `meta` tag inilah yang akan digunakan pada file `ajax-setup.js`:

```js
$(function() {
  $.ajaxSetup({
    headers: {
      'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
      }
  });
});
```

Pada `ajax-setup.js` inilah kita mengkonfigurasi metode `$.ajax()` agar selalu menyertakan HTTP header tambahan bernama `X-CSRF-Token`. Nilai dari header `X-CSRF-Token` ini diambil dari tag `<meta "csrf-token">` yang telah kita sertakan sebelumnya.

Sementara file `ajax-handler.js` akan berisi kode Javascript yang Anda gunakan untuk mengirimkan request ke server:

```js
$(function() {
  // On button click, send AJAX request
  $("#send").click(sendMessage);

  // Send AJAX request
  function sendMessage() {
    $.ajax({
      url     : "http://example.com/ajax-post",  // Request endpoint
      type    : "POST",                          // HTTP verb
      data    : { message: $("message").val() }, // Data to be sent
      success : function(data) {
        // Do something with returned response data
      }
    });
  }
});
```

## CSRF Filter

Dan terakhir kita harus memodifikasi filter CSRF yang secara *default* telah disediakan oleh Laravel:

```php
Route::filter('csrf', function() {
  if (Request::ajax()) {
    // If it is an AJAX request, use X-CSRF-Token meta
    $token = Request::header('X-CSRF-Token');
  } else {
    // Or else, use a basic hidden input which hold CSRF token
    $token = Input::get('_token');
  }

  // If CSRF token is mismtach, throw an exception
  if (Session::token() != $token) {
    throw new Illuminate\Session\TokenMismatchException;
  }
});
```

Perhatikan, jika request yang diterima server adalah AJAX, maka CSRF token akan diambil dari HTTP header dengan *key* yang bernama: `X-CSRF-Token`:

```php
if (Request::ajax()) {
  $token = Request::header('X-CSRF-Token');
}
```

## Epilog

Tentu ini hanyalah satu dari beragam cara untuk melindungi AJAX request dari serangan CSRF. Anda tentu bisa tetap menggunakan cara tradisional: menyisipkan CSRF token pada *hidden input* atau langsung menyertakannya pada parameter data dari metode `$.ajax()`. Namun saya pribadi merasa cara inilah yang paling elegan.
