---
title: Add Postmark's Tag in Laravel
date: 2020-02-09T20:45:00+07:00
tags: [laravel, php]
categories: [snippet]
description: An easy way to add a Postmark's tag in Laravel.
image: /img/laravel-logo-og.png
---
Laravel makes it super easy to work with e-mail. It ships with an SMTP based mail driver out of the box. We can also easily use API based mail drivers like Amazon SES, Mailgun, or even Postmark.

Since the Laravel's drivers are meant to be effortlessly swappable, the API tends to be more general. That's why some features might not be available out of the box, like Postmark's tag for example.

But not to worry, we can still put a tag on our mail by accessing the underlying `Swift_Message` instance on our `Mailable` class. Even though we're sending the e-mail through an API, it turns out we can still pass the `X-PM-Tag` header to set a tag on our e-mail.

Here's an example of adding an `order-shipped` tag on our e-mail:

```php
<?php

namespace App\Mail;

use App\Order;
use Swift_Message;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderShipped extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * The order instance.
     *
     * @var Order
     */
    public $order;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        // Access the Swift_Message instance to add X-PM-Tag header
        $this->withSwiftMessage(function (Swift_Message $message) {
            $message->getHeaders()->addTextHeader('X-PM-Tag', 'order-shipped');
        });

        return $this->view('emails.orders.shipped');
    }
}
```

What if we want the tag to be easily configurable when we're sending the `Mailable` class on our controller? Well, that's easy, just set the tag as a public property on our `Mailable` class.

```php
class OrderShipped extends Mailable
{
    public $order;

    public $tag;

    public function __construct(Order $order, string $tag)
    {
        $this->order = $order;
        $this->tag = $tag;
    }

    public function build()
    {
        $this->withSwiftMessage(function (Swift_Message $message) {
            $message->getHeaders()->addTextHeader('X-PM-Tag', $this->tag);
        });

        return $this->view('emails.orders.shipped');
    }
}
```

So when we instantiate our `Mailable` class, we have to pass the tag we want to use too:

```php
$order = Order::findOrFail($orderId);

// Ship order logic...

Mail::to($request->user())->send(new OrderShipped($order, 'my-custom-tag'));
```
