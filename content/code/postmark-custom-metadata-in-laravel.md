---
title: Add Postmark Custom Metadata in Laravel
date: 2021-02-18T21:04:00+07:00
categories: [snippet]
tags: [laravel, php]
images: [/img/laravel.png]
---
Postmarks support [custom metadata](https://postmarkapp.com/support/article/1125-custom-metadata-faq) to be sent along with the outbound message. You can do so by adding a custom HTTP header named `X-PM-Metadata-SOMETHING`. On [Laravel mailable](https://laravel.com/docs/8.x/mail#generating-mailables), you can set this header by accessing the underlying `Swift_Message` instance through the `withSwiftMessage` function. I create a `PostmarkMailable` class that extends the Laravel `Mailable` class.

```php
<?php

namespace App\Mail;

use Swift_Message;
use Illuminate\Mail\Mailable as BaseMailable;

abstract class PostmarkMailable extends BaseMailable
{
    // Omitted...

    public function metadata($key, $value = null)
    {
        if (is_array($key)) {
            foreach ($key as $k => $v) {
                $this->metadata($k, $v);
            }

            return $this;
        }

        $this->withSwiftMessage(function (Swift_Message $message) use ($key, $value) {
            $message->getHeaders()->addTextHeader("X-PM-Metadata-{$key}", $value);
        });

        return $this;
    }
}
```

Now, when we send a mailable that extends this `PostmarkMailable` class, we can also the metadata.

```php
// Some mailable that extends the PostmarkMailable
$mailable = new \App\Mail\OrderShipped();

// Set a single metadata
$mailable->metadata('order-id', 12345);

// Or multiple metadata at once
$mailable->metadata([
    'order-id' => 12345,
    'customer-name' => 'Luke Skywalker',
]);
```

Currently, you can only set up to 10 metadata. The field name is also limited to 20 characters, while the value is restricted to 80 characters.