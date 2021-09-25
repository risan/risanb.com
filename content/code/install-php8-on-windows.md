---
title: Install PHP 8 on Windows
date: 2021-02-24T21:54:00+07:00
categories: [log]
tags: [windows, php]
images: [/img/php.png]
---
Today I managed to install the latest PHP version 8 on my Windows machine. It's a pretty straightforward process:

* Download the binary from [windows.php.net/download](https://windows.php.net/download/). I use the *Thread Safe* version to pair it with Nginx. If you PHP as a FastCGI on IIS, choose the *Non Thread Safe* version.
* I use [Laragon](https://laragon.org/), so I just have to extract the downloaded file into Laragon's PHP directory (default to `C:\laragon\bin\php`).
* The latest PHP version 8 requires [Visual C++ redistributable packages for Visual Studio 2019](https://support.microsoft.com/en-us/topic/the-latest-supported-visual-c-downloads-2647da03-1eea-4433-9aff-95f26a218cc0). Once it's installed, you'll probably need to restart the computer.
* If you want to use PHP 8 with SQL Server, you will also need to download the PHP driver for SQL Server. You will need at least a [PHP driver for SQL Server version 5.9.0](https://github.com/microsoft/msphpsql/releases/tag/v5.9.0).
* Extract the downloaded file and place the required DLLs on the `/ext` directory within your PHP installation. Note that the DLLs have both the *Thread Safe* and *Non Thread Safe* version, choose the appropriate version for your PHP installation.
* Now all you have to do is to enable the DLLs through the `php.ini` file.