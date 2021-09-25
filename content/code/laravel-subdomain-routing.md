---
title: Laravel Subdomain Routing
date: 2021-02-17T21:19:00+07:00
categories: [snippet]
tags: [laravel, php]
images: [/img/laravel.png]
---
I know that Laravel has support for subdomain routing for a long time. It goes as early as version 4 in 2013—the first version of Laravel that I used. But I never really tried that feature, until today. It just works out-of-the-box. Of course, you still need to properly configure your webserver to point those subdomains to your Laravel's public directory. But it still blew my mind.

```php
Route::domain('{user}.example.com')->group(function () {
    Route::get('/messages/{id}', function ($user, $id) {
        // Get the {user} value through $user
    });
});
```