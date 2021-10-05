---
title: ES2015 Tutorial
description: >
    Learn various new features of ES2015 standard. From let & const, template string, arrow function,
    rest parameters, spread syntax, classes, promise, all the way to generator.
date: 2017-03-25T00:10:00+02:00
categories: [tutorial]
tags: [javascript]
images: [/img/javascript.png]
featured: true
---
{{<toc>}}

## Babel Setup

We will use [Babel ](http://babeljs.io/) to transform the ES2015 (ES6) JavaScript to plain old ES5 code.

### Install the Babel CLI and ES2015 Presets

Run the following command within your project directory:

```bash
$ yarn add babel-cli add babel-preset-es2015 -D
```

Create `.babelrc` configuration file to determine which presets to use.

```json
{
  "presets": ["es2015"]
}
```

Update the `package.json` file to configure npm `build` command, so it will run babel transformation.

```js
{
  "scripts": {
    "build": "babel src -d dist"
  },
  "devDependencies": {
    //
  }
}
```

The `-d` option is to specify the output directory. So when we run `npm run build`, the ES2015 JavaScript files within the `src` directory will be transformed into ES5 JavaScript files on `dist` directory.

## var is Hoisted to Function Block

If we use `var` to declare a variable within the conditional or loop block, it will be hoisted (moved) to its function block.

```js
function hello() {
  // var greeting is hoisted up here:
  // var greeting;

  if (false) {
    var greeting = 'Hello my friend!';
  } else {
    console.log(greeting);	// undefined
    console.log(unknown);	// ReferenceError
  }
}
```

The `greeting ` variable will be hoisted to the function block, as if it’s declared on the very top of the function  block. On the `else` block, the `greeting ` value will be `undefined` while the `unknown` variable will throw a `ReferenceError` since it’s not declared anywhere.

So it’s a good practice to always declare variable at the very top of the block, to avoid confusion.

## var VS let & const

While `var` declaration is hoisted to the function level block, the new `let` and `const` keywords will always be declared within its block. So there will be no surprise.

```js
function hello() {
  if (false) {
    var greeting = 'Hello my friend!';
    let question = 'How are you today?';
  } else {
    console.log(greeting);	// undefined
    console.log(question);	// ReferenceError
  }
}
```

While the `greeting` variable will be hoisted to the block function, the `question` declaration will stay within the `if` block. That’s why the `greeting` variable on `else` block will be `undefined` while accessing the `question`  will throw `ReferenceError`.

Similar to the `let`, the `const` keyword will also not be hoisted.

## const Is Not Really Immutable

The `const` keyword will not allow the identifier to be reassigned.

```js
const programmingLanguages = ["Javascript", "Python", "Ruby"];

// TypeError: Assignment to constant variable.
programmingLanguages = ["Scala", "Haskell"];
```

However, the value it contains is not really immutable. Although the `programmingLanguages` identifier cannot be reassigned, it’s array value can be manipulated like so:

```js
const programmingLanguages = ["Javascript", "Python", "Ruby"];

programmingLanguages.push("Scala");

// The value changes!
console.log(programmingLanguages);
```

## Template String

In the past we need to concatenate string with `+` sign if we want to use a variable or multiline string. Now with template string, we no longer need any of those. The template string is always enclosed by the back tick. Here’s an example of using a variable named `name` within a template string.

```js
let name = "John Doe";

console.log(`Hello my name is ${name}.`); // Hello my name is John Doe.
```

With template string, you can also use multiple line out of the box:

```js
let alert = `
  <div class="alert">
	<p>Something went wrong!</p>
  </div>
`
```

## The Arrow Function

Suppose we have these lines of code to print out each element within the array:

```js
[10, 20, 30].forEach(function(item) {
  console.log(item);
});
```

We can turn it into an arrow function like so:

```js
[10, 20, 30].forEach((item) => {
  console.log(item);
});
```

### Arrow Function with One Parameter

If the arrow function only use one parameter, we can omit the parentheses:

```js
[10, 20, 30].forEach(item => {
  console.log(item);
});
```

### One Liner Arrow Function

If the arrow function is only consist of one line statement, we can even turn it into a simpler form without the curly braces:

```js
[10, 20, 30].forEach(item => console.log(item));
```

### Arrow Function Without Parameter

If the arrow function does not use any parameter, we must use an empty parentheses:

```js
[10, 20, 30].forEach(() => console.log('Hello!'));
```

### Arrow Function with Multiple Parameters

Here’s an example of an arrow function with two or more parameters:

```js
[10, 20, 30].forEach((item, index) => console.log(`${index} => ${item}`));
```

### Implicit Return

If the arrow function is written into one-line statement, it will implicitly return the statement’s value:

```js
// No need return statement.
let timesTwo = [10, 20, 30].map((item) => item * 2);

// Still need return statement.
let timesThree = [10, 20, 30].map((item) => {
  return item * 3;
});
```

### The this keyword

On strict mode, the `this` keyword within the traditional callback function is always bound to the callback function itself, even if it’s declared within the class.

```js
class FooBar {
  baz() {
    [1, 2, 3].forEach(function(item) {
      console.log(this); // undefined.
    });
  }
}
```

While with the arrow function, the `this` keyword is keep bounded to the class instance:

```js
class FooBar {
  baz() {
    [1, 2, 3].forEach(item => {
      console.log(this); // FooBar {}
    });
  }
}
```

## Default Parameter

On ES2015, we now have a simple way of setting up a default parameter value for a function. Below is the `applyDiscount` function with default value of `discountPercentage` parameter is set to `10`.

```js
function applyDiscount(cost, discountPercentage = 10) {
  return cost - (cost * (discountPercentage / 100));
}

applyDiscount(100); // 90
applyDiscount(100, 25); // 75
```

We can even set a default value for parameter by calling another function:

```js
function getDefaultPercentage() {
  return 10;
}

function applyDiscount(cost, discountPercentage = getDefaultPercentage()) {
  return cost - (cost * (discountPercentage / 100));
}
```

## The Rest Parameters

The rest parameters allow us to accept an indefinite number of arguments and turn it into an array. For example, we have a function `sum` that will sum any given number as the argument:

```js
function sum(...numbers) {
  // numbers = [argument-1, argument-2, ... argument-n]
  return numbers.reduce((prev, current) => prev + current);
}

sum(10, 100, 1000); // 1110
sum(1, 2, 3, 4, 5); // 15
```

If you need another argument for a function, make sure that the rests parameter is on the last order.

```js
function sum(message, ...numbers) {
  let total = numbers.reduce((prev, current) => prev + current);
  console.log(`${message}: ${total}`);
}

sum('The total sum is', 10, 100, 1000); // The total sum is: 1110
```

## The Spread Syntax

The spread syntax is a companion for the rest parameters. It allows us to expand an array into a multiple arguments (for function call) or multiple elements (for array construction) or multiple variables.

Here’s an example of spread syntax for turning an array into multiple arguments:

```js
function greet(firstName, lastName, age) {
  console.log(`My name is ${firstName} ${lastName}, I am ${age} years old!`);
}

let john = ["John", "Doe", 25];

greet(...john); // My name is John Doe, I am 25 years old!
```

## Object Shorthand

In the past, if we are about to return an object we do it something like this:

```js
function getPerson() {
  var name = 'John Doe';
  var age = 25;
	
  return {
    name: name,
    age: age
  };
}
```

Now with ES2015, if the variable name is similar with the object’s key, we can entirely omit the keys:

```js
function getPerson() {
  let name = 'John Doe';
  let age = 25;
	
  return { name, age };
}

getPerson(); // Object {name: "John Doe", age: 25}
```

## Method Shorthand

In the past, if we need to create a method for an object, we need to use `function` keyword:

```js
function getPerson() {
  var name = 'John Doe';
	
  return {
    name: name,
    greet: function() {
      console.log('Hello my name is ' + this.name);
    }
  };
}
```

Now with ES2015, we just need to declare it with `greet()`:

```js
function getPerson() {
  let name = 'John Doe';
	
  return {
    name,
    greet() {
      console.log(`Hello my name is ${this.name}`);
    }
  };
}

getPerson().greet(); // Hello my name is John Doe
```

## Object Destructuring

In the past if we want to assign an object’s key to a variable, we do it like this:

```js
var person = {
  name: 'John Doe',
  age: 25
};

var name = person.name;
var age = person.age;
```

Now with object destructuring in ES2015, we can simplify that process like so:

```js
let person = {
  name: 'John Doe',
  age: 25
};

let { name, age } = person;

console.log(name); // John Doe
console.log(age); // 25
```

We can also use object destructuring syntax in function argument:

```js
function displayData({ message, data }) {
  console.log(`Message: ${message}`);	// Message: Success!
  console.log(`Data: ${data}`);	// Data: 999999
}

displayData({
  httpStatusCode: 200,
  message: 'Success!',
  data: 999999
});
```

## Classes

In the past we can achieve a class-like feature in JavaScript like this:

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  console.log("My name is " + this.name + "!");
};

var john = new Person("John", 25);
john.greet(); // My name is John!
```

Now in ES2015, we have a syntactical sugar for creating a class. Note that it just a syntactical sugar over the old prototype based inheritance, not introducing the object-oriented inheritance model.

```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(`My name is ${this.name}!`);
  }
}

let john = new Person("John", 25);
john.greet(); // My name is John!
```

### The Static Method

The ES2015 also introduce a syntactical sugar for static method. Like any other language, the static method is belonged to the class and is not callable by the instance.

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  static isMammals() {
    return true;
  }
}

Person.isMammals(); // true
```

### Getter Method

The getter method can be used to get a dynamically computed value. For example the `Person` class instance can have the `bornIn` properly which is dynamically calculated based on the given `age` parameter.

```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  get bornIn() {
    return (new Date).getFullYear() - this.age;
  }
}

let john = new Person("John", 25);
console.log(`John was born in ${john.bornIn}`); // John was born in 1997
```

### Setter Method

Setter method can be used to execute a function whenever a class’s property is attempted to be changed.  Here’s an example of setter method that will uppercase the `name` property.

```js
class Person {
  set name(val) {
    this._name = val.toUpperCase();
  }

  get name() {
    return this._name;
  }
}

let john = new Person();
john.name = 'john';
console.log(`Name: ${john.name}`); // Name: JOHN
```

## Promise

Promise is kind of a placeholder for an asynchronous code.

```js
function timer(duration) {
  return new Promise((resolve, reject) => {
    console.log('Timer is started...');

    setTimeout(() => {
      console.log('Timer is stopped...');
      resolve();
    }, duration * 1000)
  });
}
```

A `Promise` required one parameter named executor, which is a function passed with two arguments: `resolve` and `reject`. The executor usually contains an asynchronous codes. Within it, we call `resolve()` to resolve the promise.

We can use our `timer` function like so:

```js
let promise = timer(3);
promise.then(() => console.log('Success!')); // The is the resolve() function
```

### Reject a Promise

We can reject a promise by calling `reject()` within the executor:

```js
function timer(duration) {
  return new Promise((resolve, reject) => {
    if (duration <= 0) {
      return reject('Duration must be larger than 0!');
    }

    console.log('Timer is started...');

    setTimeout(() => {
      console.log('Timer is stopped...');
      resolve();
    }, duration * 1000)
  });
}
```

Now, if we pass `duration <= 0`, the `resolve()` function will never be called and  the `reject()` function will be called instead.

```js
let promise = timer(-3);

promise.then(() => console.log('Success!'))
  .catch(error => console.error(error));	// This is the reject() function
```

We can also reject the promise by simply throws an error:

```js
if (duration <= 0) {
	throw 'Duration must be larger than 0!';
}
```

## String Methods

ES2015 includes several new methods for String:

The `includes` method is used to check whether the string contains the given string argument:

```js
"John Doe".includes("Doe"); // true
```

The `startsWith` method is used to check whether the string starts with the given string argument.

```js
"John Doe".startsWith("John"); // true
"John Doe".startsWith("Doe", 5); // true
```

The `endsWith` method is used to check whether the string ends with the given string argument.

```js
"John Doe".endsWith("Doe"); // true
"John Doe".endsWith("Jo", 2); // true
```

The `repeat` method is used to repeat the string x-times.

```js
"ha".repeat(3); // hahaha
```

## Array Methods

There are also several new methods for array:

Though it’s not officially included on ES2015 standard, the `includes` method is already adopted by major browsers. It used to find whether the array contains the given element:

```js
[2, 3, 4].includes(4); // true
[2, 3, 4].includes(100); // false
```

The `find` method will find the first element that match the given conditional argument.

```js
[2, 3, 4, 6, 8].find((item) => item > 5); // 6
[2, 3, 4, 6, 8].find((item) => item > 100); // undefined
```

The `findIndex` is similar with the `find` method, but it will return the array’s index rather than its value:

```js
[2, 3, 4, 6, 8].findIndex((item) => item > 5); // 3
[2, 3, 4, 6, 8].find((item) => item > 100); // -1
```

## Generator

The generator is a function that can be paused and exit the function and later at some point can be resumed again. The generator will return an iterator and is marked by the asterisk symbol (`*`).

And in order to use generator we have to install the `babel-polyfill`:

```bash
$ yarn add babel-polyfill -D
```

And if you use Webpack, include the `babel-polyfill` to the `entries` option like so:

```js
module.exports = {
  entry: [
    'babel-polyfill',
    './src/main.js'
  ],
}
```

To create a generator, use `*` right before the function name. You can use the `yield` keyword to return a value and set a pause point.

```js
function *numbers() {
  console.log('Generator begin...');
  yield 1;
  yield 2;
  yield 100;
}
```

Note that if you simply call the `numbers()` it will not do anything. The generator will return an iterator which you can use in many ways, one of them is with the `next()` method:

```js
let iterator = numbers();

// Print "Generator begin..." on the first next() call
console.log(iterator.next()); // Object {value: 1, done: false}
console.log(iterator.next()); // Object {value: 2, done: false}
console.log(iterator.next()); // Object {value: 100, done: false}
console.log(iterator.next()); // Object {value: null, done: true}
```

### Accessing Iterator with for...of

Suppose we have a generator that could generate a range from `start` until `end`:

```js
function *range(start, end) {
  while (start <= end) {
    yield start;
    start++;
  }
}
```

We can loop through the iterator with the following syntax:

```js
let iterator = range(7, 10);

for (let i of iterator) {
  console.log(i);	// 7, 8, 9, 10
}
```

Note that with `for` loop, the `i` value is no longer an object, but already the value of the current step.

### Converting Iterator to Array with Spread Syntax

We can also use spread syntax to convert an iterator into an array:

```js
let myRange = [...range(7, 10)];
console.log(myRange); // [7, 8, 9, 10]
```

## Set

Set is a collection of unique items. To create it we can simply pass an array into `Set` constructor like so:

```js
let languages = new Set(['PHP', 'Laravel', 'Vue']);
```

### Set Properties & Methods

Set has various properties and methods that we can use to manipulate the collection:

```js
languages.size; // The size of the collection: 3
languages.add('Swift'); // Add new item to collection
languages.delete('Swift'); // Remove an item from collection
languages.values(); // Return an iterator of the collection
languages.clear(); // Clear all items from the collection
```

### Convert Set to an Array

We can easily convert a Set into an array by using the spread operator:

```js
let languagesArr = [...languages]; // ['PHP', 'Laravel', 'Vue']
```

### Loop Through Set

We can loop through set with `for...of` syntax like this:

```js
for (language of languages) {
	console.log(language);
}
```