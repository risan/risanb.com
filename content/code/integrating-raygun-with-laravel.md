---
title: Integrating Raygun with Laravel
date: 2020-06-07T22:15:00+07:00
categories: [snippet]
tags: [laravel, php]
images: [/img/laravel.png]
---
You can use [Raygun](https://raygun.com/) to easily monitor any errors within your Laravel application. Once you've signed up for Raygun account and got your Raygun's API key. Install the official PHP library through composer:

```bash
$ composer require mindscape/raygun4php
```

Now head over to your `app/Providers/AppServiceProvider.php` file and register the `RaygunClient` instance.

```php
<?php

namespace App\Providers;

use GuzzleHttp\Client;
use Raygun4php\RaygunClient;
use Raygun4php\Transports\GuzzleAsync;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        // Register the async transport.
        $this->app->singleton(GuzzleAsync::class, function ($app) {
            $httpClient = new Client([
                'base_uri' => 'https://api.raygun.com',
                'headers' => [
                    'X-ApiKey' => config('services.raygun.api_key'),
                ]
            ]);

            return new GuzzleAsync($httpClient);
        });

        // Register the RaygunClient instance.
        $this->app->singleton(RaygunClient::class, function ($app) {
            return new RaygunClient($app->make(GuzzleAsync::class));
        });
    }

    public function boot()
    {
        // Any requests to Raygun server will be send right before shutdown.
        register_shutdown_function([
            $this->app->make(GuzzleAsync::class), 'wait'
        ]);
    }
}
```

We register two instances: `GuzzleAsync` and the `RaygunClient` itself. We use the `GuzzleAsync` so any requests to the Raygun server are done asynchronously. This way, when we send an exception data to Raygun, it won't block the code flow. Because the request will be sent right before the PHP script shutdown. Note, that we also register these two instances as a `singleton`.

Update your `config/services.php` file to include a new entry named `raygun`:

```php
<?php

return [

    // Other settings...

    'raygun' => [
        'api_key' => env('RAYGUN_API_KEY'),
    ],

];
```

This way, when we need access to our Raygun API key, we can do something like this:

```php
config('services.raygun.api_key');
```

And we can safely put our Raygun API key within the `.env` file:

```bash
APP_NAME=Laravel

# Other settings...

RAYGUN_API_KEY="YOUR_RAYGUN_API_KEY_HERE"
```

Finally, we can start sending the exception data to Raygun within the `app/Excpetions/Handler.php`:

```php
<?php

namespace App\Exceptions;

use Throwable;
use Raygun4php\RaygunClient;
use Illuminate\Support\Facades\App;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    //...

    public function report(Throwable $exception)
    {
        parent::report($exception);

        if ($this->shouldntReport($exception)) {
            return;
        }

        // Only send exception data on non-local environment.
        if (! App::environment('local')) {
            $raygun = resolve(RaygunClient::class);

            $raygun->SendException($exception);
        }
    }

    //...
}
```

Note that on the example above, we only send an exception data if the environment is not set to `local`. You can also send additional data like [tags](https://github.com/MindscapeHQ/raygun4php#adding-tags) or [affected user](https://github.com/MindscapeHQ/raygun4php#affected-user-tracking).

```php
$raygun = resolve(RaygunClient::class);

$raygun->SendException($exception, ['your-custom-tag', 'your-other-tag']);

$raygunClient->SetUser(auth()->user()->email);
```
