---
title: Building My First iOS Game
date: 2018-10-10T00:10:00+02:00
tags: [ios, swift]
categories: [coding-journal]
description: Things I learned from building my very first iOS game using the latest Swift version 4.2.
image: ./og.jpg
---
Sunday night two weeks ago, I had nothing better to do. So I started googling for some iOS tutorial and landed on this amazing [video tutorial](https://www.raywenderlich.com/5993-your-first-ios-app) by Ray Wenderlich. It's quite exciting and easy to follow for a total beginner like me. I delved into Swift documentation before and got bored easily. 😝

On that tutorial, you'll learn the basic of iOS development by building some simple game named Bull's Eye. It generates some random number between 1 and 100. It then challenges the user to estimate and move the slider as close as possible to that random number. The closer it gets, the higher the point. It's pretty simple.

You can check out the complete project on my Github repository: [risan/bullseye-ios](https://github.com/risan/bullseye-ios).

![Bull's Eye game in action](https://media.giphy.com/media/8TzojHt7pxqv8GhXnW/giphy.gif)

Here are a few things that I learned and gathered so far about Swift programming language. Note that I use the latest Swift 4.2 version.

{{< toc >}}

## Variables, Constants, and Data Types

### Basic Data Types

There are several basic data types provided by Swift, here are some of the types that I've used so far:

* `Int`: For a positive or negative integer number (e.g. `100`, `0`, or `-12`);
* `Float`: For a decimal number (e.g. `3.14` or `-0.123`);
* `Double`: Double precision floating point number—a lot more precise than the `Float`;
* `Bool`: For boolean value (`true` or `false`);
* `Character`: For a single character (e.g. `A`, `b`, or `&`); and
* `String`: Collection of a character (e.g. `Hello World`).

#### Working with Integer

Swift also provides several other data types for handling an integer number:

* `UInt`—the unsigned version of `Int` (zero and positve number only)
* `Int8` and `UInt8`—the 8 bit version;
* `Int16` and `UInt16`—the 16 bit version;
* `Int32` and `UInt32`—the 32 bit version; and
* `Int64` and `UInt64`—the 64 bit version.

Unless you know about what you're doing, always use the `Int` data type when dealing with an integer number.

#### Working with Decimal

There are also several other data types for handling a decimal number:

* `Float32`—the 32 bit version of floating point type;
* `Float64`—the 64 bit version; and
* `Float80`—the extended precision floating point type.

However, the Swift documentation recommends us to always use the `Double` data type when dealing with a decimal number.

### Declaring a Variable

Use the `var` keyword to declare a variable:

```swift
var name: String = "John Doe"
var age: Int = 23
var score: Double = 75.34
var isAwesome: Bool = true
var grade: Character = "A"
```

Since it's a variable, we are allowed to change the value—as long as it has the same data type.

```swift
var name: String = "John Doe"

name = "Foo Bar"

// Will throw an error, because it's an integer not a string.
name = 12

// We have to explicitly convert the new value into the same data type.
name = String(12)
```

### Declaring a Constant

To declare a constant, we use the `let` keyword:

```swift
let max: Int = 100
let pi: Double = 3.14

// Will throw an error, since we're not allowed to change the value.
pi = 3.1423
```

### Type Inference

Swift is a strongly typed language. However, it allows us to declare a variable or a constant without even specifying its data type. Swift is smart enough to figure out the data type based on its initial value.

```swift
var totalItems = 5 // Int
var totalAmounts = 50.3 // Double
let message = "Success!" // String
let isPaid = true // Bool
let grade = "A" // String
```

Note that by default, a decimal number will be inferred as a `Double`—not a `Float`. A round number also will be inferred as an `Int`, even if the value may also fit in another data type like `UInt8`.

### String Extrapolation

In Swift, we can put the value of a variable or a constant within a string like this:

```swift
"Some string \(yourVariableOrConstant)"
```

When we extrapolate a variable or a constant within a string, we don't need to explicitly convert the data type—even if it's not a string.

```swift
let totalItems = 5
let totalAmounts = 50.3
let isPaid = true
let message = "Success!"

print("Total items: \(totalItems)\nTotal amount: $\(totalAmounts)")
print("Is Paid: \(isPaid)\nMessage: \(message)")
```

The above code will print the following output:

```
Total items: 5
Total amount: $50.3
Is Paid: true
Message: Success!
```

We can also use the triple quotes (`"""`) to construct a multiline string. The following code will have the same exact output like above:

```swift
print("""
Total items: \(totalItems)
Total amount: $\(totalAmounts)
Is Paid: \(isPaid)
Message: \(message)
""")
```

## Functions

Use the `func` keyword to create a function:

```swift
func sayHello() {
    print("Hello World!")
}

// Calling the function.
sayHello()
```

### Function with Parameter

We can also create a function with a parameter:

```swift
func greet(name: String) {
    print("Hello \(name)!")
}

greet(name: "Mr Data") // Hello Mr Data!

greet(name: "Darth Vader") // Hello Darth Vader!

greet(name: 123.45) // Will throw an error, since we pass a double
```

Note how we also pass the `name` when calling the `greet` function above. In Swift, the `name` is also called "argument label".

We can have as many parameters as we want:

```swift
func introduce(name: String, age: Int) {
    print("Hi my name is \(name) and I'm \(age) years old.")
}

introduce(name: "John", age: 23)

// Will throw an error, since we can't change the argument's order.
introduce(age: 19, name: "Luke")
```

Note that even though the arguments are already labeled, we can't change the order of these arguments.

### Omitting Argument Label in a Function

We can configure the function so we don't have to specify the argument label when calling it. To omit the argument label, simply put an underscore (`_`) before the parameter name:

```swift
func greet(_ name: String) {
    print("Hi \(name)!")
}

greet("Captain Kirk") // Hi Captain Kirk!

// Will throw an error, we have to omit the argument label.
greet(name: "John")
```

We can combine a named parameter with the omitted one:

```swift
func introduce(_ name: String, age: Int) {
    print("Hi my name is \(name) and I'm \(age) years old.")
}

introduce("John", age: 23) // Hi my name is John and I'm 23 years old.
```

And of course we can also have multiple parameters without any argument labels:

```swift
func introduce(_ name: String, _ age: Int) {
    print("Hi my name is \(name) and I'm \(age) years old.")
}

introduce("Jar Jar", 33) // Hi my name is Jar Jar and I'm 33 years old.
```

### Renaming the Function Parameter

In Swift, we are allowed to have a different identifier between the parameter name and the argument label.

```swift
func welcome(to name: String) {
    print("Welcome to the \(name)!")
}

welcome(to: "Jungle") // Welcome to the Jungle!
```

The `to` will be used as an argument label when calling the `welcome` function. While the `name` will be used as an identifier for the parameter within the function's body.

### Function with Return Value

So far we've only created functions with no return value. To create a function with a return value, simply use the `return` keyword and declare the return type right before the opening curly brace:

```swift
func sum(_ a: Int, _ b: Int) -> Int {
    return a + b
}

sum(10, 20) // 30
sum(10, -20) // -10
```

## Optional

"Optional" was one of the concepts that I was struggling with when trying out Swift for the first time years ago. Now I finally understand. It's simply a data type that accepts `nil` as a value—which means an absence of value. We use a question mark (`?`) to indicate an optional type:

```swift
var name: String? // Optional String type
var message: String = "John" // Just regular String type

name = "John" // We can assign a regular String value
name = nil // or we can also assign a `nil`

// However this will throw an error, since message is not an optional type.
message = nil
```

### Optional Binding

We can think of optional type as a box. It can either contain something (some value) or nothing at all (a `nil` value). In order to know what's inside of this box, we have to open it. In Swift, this process is called "unwrapping"—like unwrapping present box!

One of the way to "unwrap" an optional type is by using an optional binding. We assign the optional type to some constant using the `let` keyword; we then wrap this assignment with an `if` statement like so:

```swift
var name: String?

if let unwrappedName = name {
    // This block will be executed if name is not nil
    print("Hi \(unwrappedName)!")
} else {
    // This block will be executed if name is nil
    print("Name is empty")
}
```

## Class

Use the `class` keyword to define a class:

```swift
class Person {
    let isHuman = true
    var name = "John Doe"

    func sayHi() {
        print("Hi, my name is \(name)!")
    }
}

let john = Person()

john.isHuman // true
john.name // John Doe
john.sayHi() // Hi, my name is John Doe!

john.name = "Yoda"
john.sayHi() // Hi, my name is Yoda!

// Will throw an error because `isHuman` is a constant.
john.isHuman = false
```

Just like calling a function, we use `Person()` to initialize a new object of `Person` class. We can then use the dot (`.`) to access the object's properties and methods.

### Class Initializer

The class can also have an initializer or a constructor. This is a good place for us to set up the class's instance; like assigning some initial values to the properties:

```swift
class Person {
    var name: String
    var age:Int?

    // The class initializer
    init(name: String, age: Int?) {
        self.name = name
        self.age = age
    }

    func sayHi() {
        var message = "Hi, my name is \(name)"

        if let ageValue = age {
            message += " and I'm \(ageValue) years old"
        }

        print(message)
    }
}

let anakin = Person(name: "Anakin", age: 20)
let luke = Person(name: "Luke", age: nil)

anakin.sayHi() // Hi, my name is Anakin and I'm 20 years old
luke.sayHi() // Hi, my name is Luke
```

Note that when the parameter in a method has the same name as one of the class's property, we can use the `self` keyword to refer to the class's property.

In Swift, we are allowed to declare a function or a method with the same name, as long as it has different parameter signature. And so does the class initializer, we can have several `init()` with different parameter signature:

```swift
class Person {
    var name: String
    var age:Int?

    // The age parameter is not optional now.
    init(name: String, age: Int) {
        self.name = name
        self.age = age
    }

    // Another init but without age parameter.
    init(name: String) {
        self.name = name
    }

    func sayHi() {
        var message = "Hi, my name is \(name)"

        if let ageValue = age {
            message += " and I'm \(ageValue) years old"
        }

        print(message)
    }
}

let anakin = Person(name: "Anakin", age: 20)
let luke = Person(name: "Luke")

anakin.sayHi() // Hi, my name is Anakin and I'm 20 years old
luke.sayHi() // Hi, my name is Luke
```

## Other Discoveries

Here are some other discoveries I've made throughout the tutorial:

* We don't need to use a semicolon (`;`) at the end of each statement, unless we want to have multiple statements within one line.
* Every UI object dropped to the storyboard from the library, is an object from some class.
* Use the `@IBOutlet` keyword on the class's property if we want it to refer to some object on the storyboard.
* Use the `@IBAction` keyword on the class's method if want it to be executed when a particular event occurred on some object on the storyboard.

### Force Unwrapping

```swift
@IBOutlet weak var slider: UISlider!
```

The exclamation mark (`!`) at the end of the above code is used for unwrapping the optional type forcefully. It means that if the `slider` is `nil` the code execution will be aborted.

### Class Inheritance

```swift
class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
    }
}
```

In the code above, we declare a class named `ViewController` that inherits from the `UIViewController` class. In Swift, we are allowed to override the parent's method. To do so, we have to use the `override` keyword before the new method declaration. We can also use the `super` keyword to access parent's original methods or properties.

### Known Type Parameter

Below is the signature of the `setThumbImage` method from a `UISlider` class:

```swift
func setThumbImage(_ image: UIImage?, for state: UIControl.State)
```

Suppose we have a variable named `slider` which is an instance of the `UISlider` class. We can call the above method like this:

```swift
slider.setThumbImage(someUIImageInstance, for: UIControl.State.normal)
```

`UIControl.State` is a struct that contains several constants describing the state of a control. And since the type of the `for` argument is already known to be the `UIControl.State`, we can actually just use a dot (`.`) to access the struct's constant:

```swift
slider.setThumbImage(someUIImageInstance, for: .normal)
```

### Using a Closure

```swift
UIAlertAction(title: "OK", style: .default, handler: {
    action in
    self.startNewRound()
})
```

The code above is taken from the tutorial's source code. We declare a closure as an argument for the `handler` parameter. The `in` keyword is used to separate the closure's parameter(s) from the body. In the code above we only have one parameter: `action`—which is an instance of the newly created `UIAlertAction` class.

### Displaying Local HTML File on a WebView

Here's the code that we use to display a locally saved HTML file within the WebKit WebView:

```swift
// Load the local HTML file named "about.html"
if let htmlPath = Bundle.main.path(forResource: "about", ofType: "html") {
    let htmlUrl = URL(fileURLWithPath: htmlPath)
    let htmlUrlRequest = URLRequest(url: htmlUrl)
    webView.load(htmlUrlRequest)
}
```

Note that the `webView` identifier above refers to the `WKWebView` object on the storyboard.

## Closing Thought

I must say, so far I enjoy creating an iOS application using Swift. Swift syntax is cleaner and more concise than its predecessor—Objective C. For me it's also a lot easier to understand.

This little quest of mine, leading me to find more tutorials about building iOS development with Swift. So far I've done another 4 tutorials:

[1. Auto layout practice](https://github.com/risan/autolayout-ios)

![Auto Layout Practice](./auto-layout.jpg)

[2. Stack Views practice](https://github.com/risan/stack-views-ios)

![Stack Views Practice](./stack-views.jpg)

[3. Creating a paginated sliding cards](https://github.com/risan/sliding-cards-ios)

![Sliding Cards in Action](https://media.giphy.com/media/EQBBtahcZ36yS4ATKz/giphy.gif)

[4. A War Card Game](https://github.com/risan/war-card-game-ios)

![War Card Game in Action](https://media.giphy.com/media/3oqoBNGeV4PEbCcQcP/giphy.gif)

I probably should start reading the Swift documentation. 🤔
