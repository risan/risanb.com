---
title: Seeding Table with Relationships in Laravel
date: 2018-03-18 17:01:00
tags: [php, laravel]
description: Learn how to define relationships on Eloquent model and use Laravel's model factory to seed the database.
image: ./og.jpg
---
This is my answer to someone's question on [StackOverflow](https://stackoverflow.com/questions/49219245/laravel-5-6-how-to-seed-tables-with-relationships-to-other-tables/49219836#answer-49219836). How can we seed table with relationships in Laravel? Let's learn how to define relationships on the Eloquent model and use Laravel's model factory to seed the database.

## Table of Contents

## Model and Table Structure

Before getting started, let me explain the context of the question. Let's say we have a `Customer` model. This model has two relationships to other tables. First, it has a one-to-one relationship with `CustomerAddress` model—it means a single customer only has one address. The second relationship is one-to-many with `CustomerPurchase` model—it means a single customer may have multiple purchase records.

Let's briefly explore our model schemas.

### Customer Model

The `Customer` model is a representation of the `customers` table. It has five columns: `id`, `name`, `phone`, `created_at`, and `updated_at`. The migration file might look something like this:

```php
// Within the migration file for creating customers table.
Schema::create('customers', function (Blueprint $table) {
    $table->increments('id');
    $table->string('name');
    $table->string('phone');
    $table->timestamps();
});
```

And the model class stored in `app/Customer.php` looks like this:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = ['name', 'phone'];
}
```

### Customer Address Model

The `CustomerAddress` model represents the customer's address. It uses the `customer_addresses` table with eight columns on it: `id`, `customer_id`, `address`, `city`, `state`, `zip`, `created_at`, and `updated_at`. The migration file looks like this:

```php
// Within the migration file for creating customer_addresses table.
Schema::create('customer_addresses', function (Blueprint $table) {
    $table->increments('id');
    $table->integer('customer_id')->unsigned();
    $table->foreign('customer_id')->references('id')->on('customers');
    $table->string('address');
    $table->string('city');
    $table->char('state', 2);
    $table->char('zip', 5);
    $table->timestamps();
});
```

The model class itself stored in `app/CustomerAddress.php` and it looks like this:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CustomerAddress extends Model
{
    protected $fillable = ['address', 'city', 'state', 'zip'];
}
```

### Customer Purchase Model

Finally, the `CustomerPurchase` represents the `customer_addresses` table. It has six columns: `id`, `customer_id`, `method`, `amount`, `created_at`, and `updated_at`. Its migration file looks like this:

```php
// Within the migration file for creating customer_addresses table.
Schema::create('customer_purchases', function (Blueprint $table) {
    $table->increments('id');
    $table->integer('customer_id')->unsigned();
    $table->foreign('customer_id')->references('id')->on('customers');
    $table->enum('method', ['credit_card', 'paypal']);
    $table->decimal('amount', 8, 2);
    $table->timestamps();
});
```

The model saved in `app/CustomerPurchase.php` and it looks like this:

```php
<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CustomerPurchase extends Model
{
    const METHOD_CREDIT_CARD = 'credit_card';
    const METHOD_PAYPAL = 'paypal';

    protected $fillable = ['method', 'amount'];
}
```

## Defining Relationships

Our first step to solve this problem is to define the relationships between these three models. Let's open our `Customer` model and define its relationships both with `CustomerAddress` and `CustomerPurchase` models.

```php
class Customer extends Model
{
    // Omitted for brevity

    public function address()
    {
        return $this->hasOne(CustomerAddress::class);
    }

    public function purchases()
    {
        return $this->hasMany(CustomerPurchase::class);
    }
}
```

For the one-to-one relationship with `CustomerAddress`, we use the [`hasOne()`](https://laravel.com/docs/5.6/eloquent-relationships#one-to-one) method. While for the one-to-many relationship with `CustomerPurchase` we use the [`hasMany()`](https://laravel.com/docs/5.6/eloquent-relationships#one-to-many) method.

Note that we use singular form for a method name that defines one-to-one relationship: `address()`. And use the plural form for a method name that defines one-to-many relationship: `purchases()`. We also omit the `customer` part, since it's redundant inside the `Customer` class. This way, we'll have a clean and readable API:

```php
$customer = App\Customer::find(1);

$customer->address;

$customer->purchases->sortBy('amount');
```

### Defining Inverse Relationships

For this tutorial, it's not required to define the inverse relationships. But let's go ahead and define the relationship between `CustomerAddress` and `CustomerPurchase` models:

```php
class CustomerAddress extends Model
{
    // Omitted for brevity

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
```

We also define the identical `customer()` method within the `CustomerPurchase` model:

```php
class CustomerPurchase extends Model
{
    // Omitted for brevity

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
```

## The Model Factory

Next, we're going to need to write a model factory for each of our models. We can generate a model factory through artisan command. Open our your terminal and type the following command within your Laravel's project directory:

```bash
$ php artisan make:factory CustomerFactory
```

This will create a new file in `app\database\factories\CustomerFactory.php`. We can have a separate file for each of our model or we can just write all of the model factories code within this single file. Open up the `CustomerFactory.php` file and define the model factory for our three models:

```php
<?php

use App\Customer;
use App\CustomerAddress;
use App\CustomerPurchase;
use Faker\Generator as Faker;

$factory->define(Customer::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
        'phone' => $faker->phoneNumber,
    ];
});

$factory->define(CustomerAddress::class, function (Faker $faker) {
    return [
        'address' => $faker->streetAddress,
        'city' => $faker->city,
        'state' => $faker->stateAbbr,
        'zip' => $faker->postcode,
    ];
});

$factory->define(CustomerPurchase::class, function (Faker $faker) {
    return [
        'method' => $faker->randomElement([
            CustomerPurchase::METHOD_CREDIT_CARD,
            CustomerPurchase::METHOD_PAYPAL,
        ]),
        'amount' => $faker->randomFloat(2, 10, 200),
    ];
});
```

By default, Laravel provides us with [`Faker`](https://github.com/fzaninotto/Faker) library that we can use to generate a random data.

On model factory for `CustomerPurchase`, we use `randomElement` method. It will simply pick a single item from the given array. On our case, we passed the `METHOD_CREDIT_CARD` and `METHOD_PAYPAL` constants, so it will randomly return a string either `credit_card` or `paypal`.

## Database Seeding with Model Factory

Our model's relationships are set and the model factories are ready to use. We can now seed our database!

We can create a separate class for our seeder. But let's keep it simple and write the code to the `database\seeds\DatabaseSeeder.php` file:

```php
<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create 10 records of customers
        factory(App\Customer::class, 10)->create()->each(function ($customer) {
            // Seed the relation with one address
            $address = factory(App\CustomerAddress::class)->make();
            $customer->address()->save($address);

            // Seed the relation with 5 purchases
            $purchases = factory(App\CustomerPurchase::class, 5)->make();
            $customer->purchases()->saveMany($purchases);
        });
    }
}
```

First, we created 10 customers with random data. Then we loop through the created model's collection with [`each`](https://laravel.com/docs/5.6/collections#method-each) method.

```php
factory(App\Customer::class, 10)->create()->each(function ($customer) {
    //
});
```

For each of the created model instance, we then create one customer address record. We save this one-to-one relationship with the [`save()`](https://laravel.com/docs/5.6/eloquent-relationships#the-save-method) method:

```php
$address = factory(App\CustomerAddress::class)->make();
$customer->address()->save($address);
```

We also create 5 purchase records for each customer. We then save this one-to-many relationship with `saveMany()` method:

```php
$purchases = factory(App\CustomerPurchase::class, 5)->make();
$customer->purchases()->saveMany($purchases);
```

To run the database seeders, run the following artisan command on our terminal:

```bash
$ php artisan db:seed

# Or if you just want to run a particular seeder class
$ php artisan db:seed --class=CustomersTableSeeder
```

And if you want to re-run all of your migration files, you may pass the `--seed` option to run the seeders.

```bash
$ php artisan migrate:refresh --seed
```

Our `customers`, `customer_addresses`, and `customer_purchases` should now be filled with random data.

Further readings:
- [Eloquent Relationships](https://laravel.com/docs/5.6/eloquent-relationships)
- [Using Factories with Relationships](https://laravel.com/docs/5.6/database-testing#relationships)

Credits:
- Coffee seeds by [Christian Joudrey](https://unsplash.com/@cjoudrey) on [Unsplash](https://unsplash.com/photos/aO_jMXTduUE).
