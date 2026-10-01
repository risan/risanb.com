---
languageCode: id
title: Tutorial Dasar Facebook PHP SDK
date: 2014-01-29T20:00:00+07:00
categories: [tutorial]
tags: [php]
---
Pada tutorial kali ini kita akan mempelajari dasar-dasar penggunaan Facebook PHP SDK untuk mengakses API dari Facebook. Kita akan membuat aplikasi sederhana untuk menampilkan data profil Facebook dari pengguna yang menggunakan aplikasi kita.

## Mendaftarkan Aplikasi Facebook

Sebelum membahas lebih lanjut, Anda perlu memiliki Facebook *App ID* serta *App Secret* sebagai prasyarat mengakses API Facebook. Untuk mendapatkan *App ID* dan *App Secret*, Anda harus mendaftarkan aplikasi Anda di [Facebook Developer](https://developers.facebook.com/apps).
￼
Pada laman developer, klik menu *Apps > Create a new app*. Akan ada jendela popup yang muncul, isikan nama, *namespace* (opsional), serta kategori dari aplikasi Anda. Kemudian klik tombol **Create App** untuk mendaftarkan aplikasi baru Anda.

Jika berhasil, Anda akan dibawa ke laman dashboard. Di laman ini Anda akan mendapatkan *App ID* serta *App Secret* untuk aplikasi Anda.
￼
Sekarang buka menu *Settings* yang ada di samping kanan untuk melakukan sedikit konfigurasi. Pada bagian paling bawah dari tab *Basic*, klik tombol **+ Add Platform** untuk menambahkan platform dari aplikasi Facebook kita. Akan muncul popup yang berisi pilihan berbagai platform: klik **Website**.
￼
Setelah platfrom berhasil ditambahkan, akan ada panel baru dengan judul "Website". Pada panel baru ini, isikan alamat Url lengkap dari aplikasi kita ke isian **Site URL**.
￼
Klik tombol **Save Changes** untuk menyimpan perubahan yang telah kita terapkan.

## Instalasi Facebook PHP SDK

Facebook PHP SDK digunakan untuk mempermudah akses ke API Facebook. Untuk menyertakannya ke dalam aplikasi yang kita buat, kita akan menggunakan bantuan [Composer](https://getcomposer.org/). Menggunakan teks editor favorit Anda, buatlah file `composer.json` berikut dan simpan di dalam direktori aplikasi Anda.

```json
{
  "require" : {
    "facebook/php-sdk" : "*"
  }
}
```

Di dalam direktori aplikasi Anda, jalankan perintah Composer berikut untuk meng-install Facebook PHP SDK:

```sh
$ composer install
```

Jika instalasi sudah selesai, Anda akan mendapati direktori facebook di dalam direktori `vendor` Anda.

Jika Anda tidak menggunakan Composer, Anda bisa langsung mengunduh Facebook API SDK langsung dari [repository Github](https://github.com/facebook/facebook-php-sdk/archive/master.zip). Ekstrak file ZIP tersebut dan *copy* direktori `src` ke dalam direktori aplikasi Anda.

## Mendapatkan ID User

*Now, let's dive into the code*! Hal pertama yang akan kita lakukan adalah mendapatkan ID Facebook dari pengguna aplikasi kita. Buat file `index.php` di dalam direktori aplikasi Anda, buat kode berikut:

```php
<?php
// Include Composer autoloader
require 'vendor/autoload.php';

// Create an instance of Facebook class
$fb = new Facebook(array(
  'appId'  => 'YOUR_APP_ID',
  'secret' => 'YOUR_APP_SECRET',
));

// Get the user ID
$user = $fb->getUser();
```

Pertama kita menyertakan file *autoloader* yang secara otomatis di-*generate* oleh Composer. Jika Anda tidak menggunakan Composer dan teknik *autoloading*, Anda bisa secara manual menyertakan file class `facebook.php`:

```php
require 'src/facebook.php';
```

Selanjutnya kita membuat objek dari class `Facebook`. Objek inilah yang akan kita gunakan untuk mengakses beragam API Facebook. Jangan lupa untuk mengganti `YOUR_APP_ID` dan `YOUR_APP_SECRET` dengan *App ID* serta *App Secret* dari aplikasi Anda.

Pada baris terakhir kita memanggil metode `getUser()` untuk mendapatkan Facebook ID dari pengguna aplikasi kita. Jika pengguna belum terhubung dengan akun Facebook-nya, metode `getUser()` akan mengambalikan nilai `0`.

## Mendapatkan Profil Pengguna

Masuk ketahap selanjutnya: mendapatkan profil pengguna, tambahkan potongan kode berikut kedalam file `index.php` Anda:

```php
// If we get a connected Facebook user ID
if($user) {
  // Try to fetch the connected user profile
  try {
    $user = $fb->api('/me');
  } catch (FacebookApiException $e) {
    // If the connected user has an invalid access token
    // Access token became invalid because user logged out of Facebook
    $user = false;
  }
}
```

Dengan metode `getUser()`, kita mendapatkan ID dari pengguna yang telah login dengan menggunakan akun Facebook-nya. Meskipun begitu, pengguna tersebut belum tentu masih "login"; oleh karenanya kita menggunakan blok `try` and `catch`.

Jika kita mendapatkan ID Facebook pengguna dan ia masih login, kita panggil API Facebook untuk mendapatkan data profil pengguna:

```php
$user = $fb->api('/me');
```

Sementara jika kita mendapatkan ID pengguna, tetapi ternyata ia sudah logout dari akun Facebook-nya, kita *assign* saja data `false`.

```php
$user = false;
```

## Sentuhan Akhir

Sebagai sentuhan terakhir, kita akan menampilkan data profil pengguna jika ia sudah terotentikasi dan akun Facebook-nya masih dalam keadaan login. Kita juga akan menampilkan tautan untuk login menggunakan Facebook, kepada pengguna yang belum terotentikasi atau akun Facebook-nya dalam kondisi ter-*logged out*. Tambahkan kode berikut:

```php
// If user is authenticated and still logged-in
if ($user) {
  // Display user profile
  echo "ID: $user[id] <br>";
  echo "Name: $user[name] <br>";
  echo "Profile URL: $user[link] <br>";
  echo "Bio: $user[bio] <br>";
  echo "Gender: $user[gender]";
} else {
  // If user is not authenticated or not logged-in yet
  // Display login Url
  $loginUrl = $fb->getLoginUrl();
  echo "<a href='$loginUrl'>Login with Facebook</a><hr>";
}
```

Jika pengguna masih terotentikasi dan masih dalam keandaan login, kita menampilkan beberapa data profil pengguna:

```php
echo "ID: $user[id] <br>";
echo "Name: $user[name] <br>";
echo "Profile URL: $user[link] <br>";
echo "Bio: $user[bio] <br>";
echo "Gender: $user[gender]";
```

Perhatikan bahwa pemanggilan `$fb->api('/me')` akan mengambalikan data profil pengguna dalam bentuk *associative-array*. Tentu apa yang kita tampilkan dalam contoh kode di atas baru sebagian dari data profil pengguna, masih ada *field-field* lainnya: `username`, `first_name`, `quotes`, `work`, `education`, dan lain-lain. Gunakan saja `print_r($user)` untuk melihat semua data yang didapatkan.

Sementara apabila pengguna belem terotentikasi atau status akun Facebook-nya sudah *logged-out*, maka kita akan tampilkan tautan untuk login:

```php
$loginUrl = $fb->getLoginUrl();
echo "<a href='$loginUrl'>Login with Facebook</a><hr>";
```

Metode `get:loginUrl()` digunakan untuk men-*generate* tautan untuk login. Sekarang jalankan aplikasi kita. Apabila kita mengklik tautan "Login with Facebook" tersebut, kita akan dibawa ke laman otentikasi Facebook.
￼
Pada popup yang muncul, klik tombol Ok untuk mengijinkan aplikasi mengakses akun facebook kita. Bila proses otentikasi sukses, kita akan dibawa kembali ke alamat aplikasi kita. Hasilnya, kita akan mendapatkan data profil kita pada laman aplikasi.
￼
Bagaimana? Mudah bukan? Lengkapnya, file `index.php` kita akan terlihat seperti ini:

```php
<?php
require 'vendor/autoload.php';

$fb = new Facebook(array(
  'appId'  => 'YOUR_APP_ID',
  'secret' => 'YOUR_APP_SECRET',
));

$user = $fb->getUser();

if($user) {
    try {
      $user = $fb->api('/me');
    } catch (FacebookApiException $e) {
      $user = false;
    }
}

if ($user) {
  echo "ID: $user[id] <br>";
  echo "Name: $user[name] <br>";
  echo "Profile URL: $user[link] <br>";
  echo "Bio: $user[bio] <br>";
  echo "Gender: $user[gender]";
}

else {
  $loginUrl = $fb->getLoginUrl();
  echo "<a href='$loginUrl'>Login with Facebook</a><hr>";
}
```

Anda juga bisa mengunduh seluruh *source-code* pada tutorial ini di [repository Github](https://github.com/risan/risan-myapp). Tabik.
