---
lang: id
title: Realtime Notification using PHP and Pusher
date: 2014-01-27T19:00:00+07:00
categories: [tutorial]
tags: [php]
---
Pada tutorial kali ini kita akan membangun sistem notifikasi *realtime* sederhana dengan menggunakan PHP serta layanan *third-party* dari [Pusher](http://pusher.com/). Pusher adalah layanan *cloud* untuk mempermudah pengembangan aplikasi *realtime*. Selain Pusher, masih banyak *provider* lain yang menyediakan layanan sejenis, seperti [Firebase](https://www.firebase.com/) dan [PubNub](http://www.pubnub.com/) .

## Registrasi Akun Pusher

Jika Anda belum memiliki akun Pusher, registrasi dahulu [di sini](http://pusher.com/pricing). Setelah proses registrasi berhasil dilakukan, Anda akan diarahkan ke laman *dashboard* dari aplikasi Pusher. Di sisi sebelah kanan, Anda akan mendapati *App Credential* yang nantinya akan kita gunakan untuk mengakses API dari Pusher.
￼
## Form Pengirim Pesan Notifikasi

Sekarang kita akan membuat laman HTML yang menampilkan form untuk mengirim pesan notifikasi. Tidak ada yang spesial, hanya form dengan satu buah input text yang menjadi masukan bagi pesan notifikasi. Proses pengirimannya sendiri akan ditangani oleh file `push-process.php`.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Push Notification</title>
  </head>
  <body>
    <form action="push-process.php" method="post">
      <input type="text" name="message"><br>
      <input type="submit" value="Push Message!">
    </form>
  </body>
</html>
```

Simpan kode tersebut sebagai file HTML: `push.html`. Pembuatan form ini tentu hanya untuk contoh semata. Pada implementasi sebenarnya pesan notifikasi akan di-*generate* secara otomatis oleh aplikasi itu sendiri.

## Mengirim Pesan Notifikasi ke Pusher

Pada langkah sebelumnya, kita mengarahkan form *submission* ke file `push-process.php`—file inilah yang sebenarnya akan menangani pengiriman pesan notifikasi ke Pusher.

Pusher sendiri telah menyediakan *library* PHP yang siap digunakan: [Pusher PHP Library](https://github.com/pusher/pusher-php-server). Kita akan menggunakan *library* ini untuk mempermudah pengiriman pesan notifikasi. Anda bisa menggunakan [Composer](http://getcomposer.org/) atau unduh langsung class `Pusher`-nya [di sini](https://raw2.github.com/pusher/pusher-php-server/master/lib/Pusher.php).

Berikut adalah kode lengkap untuk mengirimkan pesan notifikasi ke Pusher:

```php
<?php
// Include Pusher PHP library
include(‘Pusher.php’);

// Your Pusher App credential
define(‘APP_KEY’    , ‘xxxxxxxxx’);
define(‘APP_SECRET’ , ‘xxxxxxxxx’);
define(‘APP_ID’     , ‘xxxx’);

// Channel and event name
define(‘CHANNEL’    , ‘my_channel’);
define(‘EVENT’      , ‘notification’);

// Get a submitted message
$message = trim(htmlspecialchars($_POST[‘message’]));
// Create Pusher object
$pusher = new Pusher(APP_KEY, APP_SECRET, APP_ID);
// Data to be sent to Pusher
$data = array(‘message’ => $message);
// Push data to Pusher
$pusher->trigger(CHANNEL, EVENT, $data);

// Redirect back to form
header(‘location: push.html’);
```

Gantilah nilai dari `APP_KEY`, `APP_SECRET`, serta `APP_ID` sesuai dengan *app credential* dari aplikasi Pusher Anda.

Pesan yang dikirimkan ke Pusher, kemudian akan di-*broadcast* keseluruh client yang "mendengarkan" channel terkait. Pada langkah selanjutnya kita akan membahas cara "mendengarkan" notifikasi yang dikirimkan.

## Mendengarkan Notifikasi

Sekarang yang tinggal kita lakukan adalah "mendengarkan" pesan notifikasi yang dikirimkan dan menampilkannya. Untuk "mendengarkan" pesan notifikasi secara realtime, kita membutuhkan  [Pusher Javascript Client](https://github.com/pusher/pusher-js) . Anda bisa mengunduhnya dari Github, atau langsung menggunakan URL file yang disediakan Pusher:  [http://js.pusher.com/2.1/pusher.min.js](http://js.pusher.com/2.1/pusher.min.js) .

Sebagai langkah opsional, kita akan menggunakan  [jQuery](http://jquery.com/)  serta plugin-nya  [jQuery Growl](https://github.com/jboesch/Gritter/)  untuk memperindah tampilan notifikasi. Berikut adalah kode lengkap untuk "mendengarkan" dan menampilkan pesan notifikasi yang dikirim:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Realtime Push Notification</title>
    <!— jQuery Growl CSS. —>
    <link rel="stylesheet" href="css/jquery.gritter.css">
  </head>
  <body>
    <h1>Realtime Notification</h1>

    <!— Include jQuery CDN file. —>
    <script src="//code.jquery.com/jquery-1.10.2.min.js"></script>
    <!— Include jQuery Growl plugin. —>
    <script src="js/jquery.gritter.min.js"></script>
    <!— Include Pusher javascript client. —>

    <script src="http://js.pusher.com/2.1/pusher.min.js"></script>
    <script>
      $(function() {
        // Create Pusher object.
        var pusher = new Pusher(‘APP_KEY’);
        // Listen to desired channel.
        var channel = pusher.subscribe(‘my_channel’);
        // Catch notification message
        channel.bind(‘notification’, function(data) {
          addNotif(data.message);
        });

        // Display notification message.
        function addNotif(message) {
          $.gritter.add({
            title   : ‘Notification’,   // Growl title
            text    : message,          // Growl notif message
            time    : 8000,             // Time to life
          });
        }
      });
    </script>
  </body>
</html>
```

Ganti nilai dari `APP_KEY` sesuai dengan *app credential* dari aplikasi Pusher Anda. Simpan kode berikut sebagai file html: `index.html`.

Tes aplikasi yang telah kita buat dengan membuka `index.htm` serta `push.html` pada jendela yang berbeda. Cobalah kirimkan pesan lewat laman `push.html`, jika berhasil Anda akan mendapatkan pesan notifikasi tersebut di laman `index.html`!
￼
Anda juga bisa mengunduh seluruh *source code* lengkap dari tutorial ini di repository berikut: [PHP Realtime Notification](https://github.com/risan/php-realtime-notification). Tabik.
