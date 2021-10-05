---
title: Windows, PHP 8, Laravel Subdomain Routing
date: 2021-02-24T21:54:00+07:00
categories: [log]
tags: [windows, php]
images: [/img/php.png]
---
## Install PHP 8 on Windows

Today I managed to install the latest PHP version 8 on my Windows machine. It's a pretty straightforward process:

* Download the binary from [windows.php.net/download](https://windows.php.net/download/). I use the *Thread Safe* version to pair it with Nginx. If you PHP as a FastCGI on IIS, choose the *Non Thread Safe* version.
* I use [Laragon](https://laragon.org/), so I just have to extract the downloaded file into Laragon's PHP directory (default to `C:\laragon\bin\php`).
* The latest PHP version 8 requires [Visual C++ redistributable packages for Visual Studio 2019](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0). Once it's installed, you'll probably need to restart the computer.
* If you want to use PHP 8 with SQL Server, you will also need to download the PHP driver for SQL Server. You will need at least a [PHP driver for SQL Server version 5.9.0](https://github.com/microsoft/msphpsql/releases/tag/v5.9.0).
* Extract the downloaded file and place the required DLLs on the `/ext` directory within your PHP installation. Note that the DLLs have both the *Thread Safe* and *Non Thread Safe* version, choose the appropriate version for your PHP installation.
* Now all you have to do is to enable the DLLs through the `php.ini` file.

## Host File Location on Windows

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

## Laravel Subdomain Routing

I know that Laravel has support for subdomain routing for a long time. It goes as early as version 4 in 2013—the first version of Laravel that I used. But I never really tried that feature, until today. It just works out-of-the-box. Of course, you still need to properly configure your webserver to point those subdomains to your Laravel's public directory. But it still blew my mind.

```php
Route::domain('{user}.example.com')->group(function () {
    Route::get('/messages/{id}', function ($user, $id) {
        // Get the {user} value through $user
    });
});
```