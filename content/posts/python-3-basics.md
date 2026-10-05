---
title: Python 3 Basics
description: >
    Learn Python 3 from scratch. Strings, flow control, lists, dictionaries, functions,
    modules, files, exceptions, classes, and pip.
date: 2017-12-10T10:00:00+02:00
categories: [tutorial]
tags: [python]
images: [/img/python.png]
---
An introduction to Python 3, for someone who already knows other programming languages. Most of it is about how Python does the things you already know from elsewhere. Some parts also mention how Python 2 behaves, since you may still run into it.

{{<toc>}}

## Getting Started

### Hello World

Let us start with the classic.

```python
print("Hello World")

# On python2 you can also call it like this
# but on python3 it will throw an error
print "Hello World"
```

### Checking for None

Python has `None` instead of `null`.

If you’ve used other programming languages, you may have learned that an empty object is not the same as an object that does not exist. In this lesson, you’ll learn how to check for None (or Null objects) in Python.

Check `None` with `is` is faster than using a comparison.
```python 
foo = None

# This is faster.
if foo is None:
	print("foo is none.")

# This is slower since Python will do id comparison
# Everything in Python has an id and value, to check the id of variable foo:
# id(foo)
if foo == None:
	print("foo is none.")
```

### Mutable vs Immutable Objects

Knowing which objects are mutable tells us whether a value is changed in place or a new object is created.

In this lesson, you will learn what mutable and immutable objects are, and the difference between them. This understanding will help you determine when objects can be modified in place, and when new objects must be created.

String, integer, and tuples are immutable in python. So instead of modifying the value of the variable, python will rather create a new variable.
```python
# List and dictionary are muttable
foo = []
id(foo) # 4463192040
foo.append(3)
id(foo) # 4463192040 => same id eventhough we added a new item

# Integer is immutable
bar = 4
id(bar) # 140198717449104
bar = 100
id(bar) # 140198717450752 => different id because we assign a different value
```

### Math Operations

```python
10 / 4 # 2.5
10 // 4 # 2

# On python2 you need to provide a decimal point so the division result won't be rounded
10 / 4 # 2
10 / 4. # 2.5
```

### Formatting Strings

```python
print('Hello World') # can use single quote
print("Hello World") # use double quote
print("John's car") # Use single quote inside double quote
print('John\'s car') # Need to escape single quote within single quote

# Multiline
multi = """Lorem ipsum
dolor sit
amet."""

item = 'car'
color = 'red'
print("John's %s is %s" % (item, color))
# Or using format method
print("John's {0} is {1}".format(item, color))
```

### String Methods

```python
# Find the index of the given string
"Hello world".find('ello') # 1, will return -1 if not found

# Check if it's ended with the givens tring
"Hello world".endswith('world'); # True

# Remove extra whitespaces
"  Hello world  ".strip() # 'Hello World'

# Format a string
"Hello {0}".format('world') # 'Hello world'

# Join an array of string
"".join(['lorem ', 'ipsum ', 'dolor']) # lorem ipsum dolor

# Check all available methods on string
dir("foo")
# Check for how to use it
help("foo".strip)
```

### Flow Control

Python uses indentation to group statements, so make sure it is right.

Indentation is important!
```python
x = int(input('Enter some integer number: '))

if x < 0:
    print("It's negative number")
elif x == 0:
    print("It's zero")
else:
    print("It's %d" % (x))
```

The `for` loop:
```python
# For loop: 0 - 9
for i in range(10):
    print(i)

# For loop: 5-9
for i in range(5, 10):
    print(i)

# For loop: 0 - 10 with 2 increment
for i in range(0, 10, 2):
    print(i)

# For loop: 10 - 1 backward
for i in range(10, 0, -1):
    print(i)
```

The `while` loop:
```python
while x < 10:
    print(x)
    x+=1
```

Loop through list:
```python
pets = ['car', 'dog', 'fish']

for pet in pets:
    print('We love {0}!'.format(pet))
```

Exit from the loop:
```python
pets = ['car', 'dog', 'fish']

for pet in pets:
    if pet == 'dog':
        print('No dogs allowed!')
        break
    else:
        print('We love {0}!'.format(pet))
```

### Comparison Operators

```python
5 == 5 # True
5 == '5' # False
5 != 10 # True
5 >= 5 # True
5 <= 4 # False

# Comparing list
[1,2,3] == [1,2,3] # True
[1,2,3] == [1,3,2] # False

# Combining it with boolean operator
10 > 5 and 10 > 7 
# same as
(10 > 5) and (10 > 7) # the boolean operator has lower priority so no need for braces ()

x > 50 and x < 1000 # True
# same as
50 < x < 1000 # True
```

The `is` comparator
```python
# Check data type
isinstance(40, int) # True
isinstance('hello', str) # True
isinstance(4.2, float) # True

a = 100 # id(a) = 4307706368
b = 100 # id(b) = 4307706368 => same as a
a is b # True

a = [1,2,3] # id(a) = 4318249928
b = [1,2,3] # id(b) = 4311786248 => different
a is b # False
```

The `in` comparator
```python
x = [99, 23, 78]
99 in x # True
10 in x # False

pets = ['cat', 'dog', 'fish']
'fish' in pets # True
'unicorn' in pets # False

# Or with dictionary
person = {'name': 'john', 'age': 17}
'age' in person # True
'height' in person # False
```

### Lists

Lists are the arrays of Python.

```python
# A list can contain anything
a = [10, 4.3, 'Hello', {'name': 'John'}]

# Access a list by it's index
a[2] # 'Hello'
```

List methods:
```python
pets = ['cat', 'dog', 'fish']

# Add to the list
pets.append('mouse')
pets.append('cat')
pets # ['cat', 'dog', 'fish', 'mouse', 'cat']

# Remove from the list
pets.remove('cat') # ['dog', 'fish', 'mouse', 'cat'] => only one being removed

# Pop from the list
pets = ['dog', 'fish', 'mouse', 'cat']
pets.pop() # return 'cat' and is removed from the list
pets.pop(1) # return 'fish' and is removed from the list

# Sort alphabetically
pets = ['dog', 'fish', 'cat']
pets.sort() # ['cat', 'dog', 'fish']

# Reverse the order
pets = ['dog', 'fish', 'cat']
pets.reverse() # ['cat', 'fish', 'dog']

# Get total item in list
pets = ['dog', 'fish', 'cat']
len(pets) # 3

# Get total occurance of the given item
pets = ['dog', 'fish', 'cat', 'fish']
pets.count('fish') # 2
```

### Slicing a List

Slicing works on lists the same way it works on strings.

```python
x = [0,1,2,3,4,5,6,7,8,9]
x[2:5] # [2, 3, 4] => start at index-2 until index-5 (last index is not included)
x[2:] # [2, 3, 4, 5, 6, 7, 8, 9]
x[:5] # [0, 1, 2, 3, 4]

# Use negative index
x[-3:] # [7, 8, 9]
x[:-3] # [0, 1, 2, 3, 4, 5, 6]
x[-4:-1] # [6,7,8]

# Replace list item with slice
x[2:5] = ['foo', 'bar', 'baz'] # [0, 1, 'foo', 'bar', 'baz', 5, 6, 7, 8, 9]
# with more replacement
x[2:5] = ['foo', 'bar', 'baz', 'qux'] # [0, 1, 'foo', 'bar', 'baz', 'qux', 5, 6, 7, 8, 9]
# with less replacement
x[2:5] = ['foo'] # [0, 1, 5, 6, 7, 8, 9]
```

### List Comprehensions

A list comprehension is a shorter way to build a list from another list.

```python
zoo_animals = ['lion', 'zebra', 'monkey', 'bear', 'horse']
my_animals = ['monkey', 'horse']

not_my_animals = []

for animal in zoo_animals:
    if animal not in my_animals:
        not_my_animals.append(animal)

print(not_my_animals) # ['lion', 'zebra', 'bear']
```

With list comprehensions:
```python
not_my_animals = [animal for animal in zoo_animals if animal not in my_animals]
print(not_my_animals) # ['lion', 'zebra', 'bear']

[{to return} for {i} in {list_1} if condition of {i}]

# You can also spread it into multiple lines
not_my_animals = [
    animal 
    for animal in zoo_animals 
    if animal not in my_animals
]

# Double the items
items = [100, 200, 300]
doubled = []
for item in items:
    doubled.append(item * 2)
print(doubled) # [200, 400, 600]

# Or it can be simpler
doubled = [item * 2 for item in items]
```

### Dictionaries

```python
age = {'will': 10, 'dan': 20}

# Add to dictionay
age['john'] = 30

# Check if the key exists
'will' in age # True
'jane' in age # False

# Get value by key and spacify a default value 
age.get('will', 'Ooops, nada!') # 10
age.get('jane', 'Ooops, nada!') # 'Ooops, nada!'

# Remove item by key
del age['will']

# Loop through dictionary
for key, value in age.items():
	print('{0}, {1} years old'.format(key, value))
```

### Tuples

The tuple is a new data structure to Python, and is an immutable sequence of values separated by commas. Learn how to create them in this lesson.
```python
# Create a tuples
t = 'cat', 'fish', 2000

# Access a tuples item
t[1] # 'fish'

# You cannot reassign a tuple item
t[1] = 'dog' # Will throw error
```

### Sets

A set is an unordered collection with no duplicate items.

A set is an unordered collection with no duplicate items in Python. 
```python
# Create a set
animals = {'cat', 'dog', 'fish', 'cat'} # {'cat', 'fish', 'dog'} => no duplicated items

# Add item to a set
animals.add('unicorn')
animals.add('bear')

# Remove item from a set
animals.remove('unicorn')

# Combine two sets
fishes = {'shark', 'tuna'}
combined = animals.union(fishes) 
# {'fish', 'cat', 'bear', 'dog', 'tuna', 'shark'}

# Create an empty set
x = set() # since {} already use to create empty dict
```

### Logging

The built-in `logging` module is enough for most applications.

```python
import logging
logging.warning('This is a warning message!')
WARNING:root:This is a warning message!
{Severity}:{The application scope}:{Message}

# Severity level: CRITICAL, ERROR, WARNING (default threshold level), INFO, DEBUG
# Won't print anything, since the default threshold is WARNING thus INFO & DEBUG won't log anything
logging.info('This is info')
```

Setting up severity level:
```python
import logging

logging.basicConfig(filename='./demo.log', level=logging.INFO)

logging.critical('This is critical!')
logging.error('This is error!')
logging.warning('This is warning!')
logging.info('This is info!')
logging.debug('This is debug!')
```

It will create a log file named `demo.log` if you open it, there will be no DEBUG level being printed:
```
CRITICAL:root:This is critical!
ERROR:root:This is error!
WARNING:root:This is warning!
INFO:root:This is info!
```

Adding timestamp:
```python
logging.basicConfig(filename='./demo.log', level=logging.INFO, format='%(asctime)s %(levelname)s:%(message)s')
```

Allow user to pass the severity level with command line argument:
```python
import sys
import getopt
import logging

# Default level if none passed
log_level = logging.WARNING

# sys.argv => the first index is the filename (so we can ignore it), the rest is the given arguments
# getopt(args, shortOpts, [longOpts]) => Basically extract the targetted option
# opts will contain an array of sets (option, value)
opts, args = getopt.getopt(sys.argv[1:], 'l:', ['log='])

for opt, arg in opts:
    if opt in ['-l', '--log']:
        # Get the integer value that represent the severity level
        log_level = getattr(logging, arg.upper())

logging.basicConfig(filename='./demo.log', level=log_level, format='%(asctime)s %(levelname)s:%(message)s')

# You can use it like so
python log.py -l error # or
python log.py --log error
```

### Reading Input from the Console

```python
# Python 3
name = input('Your name: ')

# Python 2
name = raw_input('Your name: ') 

# Remember the `input` method will return a string, so if you need a number, you need to cast it
number = int(input('Enter number: '))
```

## Functions, Modules and Files

Next, how to organize the code and talk to the outside world.

### Functions

```python
def say_hello(name):
    print('Hello, my name is {0}'.format(name))

x = say_hello('John')
print(x) # None => function will always return a value. If there's no return value being defined, None type will be returned.

# With return value.
def add(a, b):
	return a + b

print(add(10, 20)) # 30
```

It’s considered a good practice to include a doc string:
```python
def say_hello(name):
    """
    Say hello to the world
    """
    print('Hello, my name is {0}'.format(name))

help(say_hello)
# say_hello(name)
#    Say hello to the world
# (END)
```

Argument with default value:
```python
def say_hello(name='Anonymous'):
    print('Hello, my name is {0}'.format(name))

say_hello() # Hello, my name is Anonymous
```

Using keyword argument
```python
def say_hello(name, age, hobby='programming'):
    print('Name: {0}\nAge: {1}\nHobby: {2}'.format(name, age, hobby))

# With keyword argument, you can have different argument order
say_hello('John', hobby='cycling', age=27)

# Once you've used the keyword argument, the rest of the arguments must use the keywords too
say_hello('John', age=27, 'cycling') # syntax error
```

### Modules

A module is a function extracted to a file. This allows you to import the function and use it in any other code you may write.
```python
# odd.py
def is_odd(number):
    return number % 2 != 0

# using_odd.py
import odd

if (odd.is_odd(18)):
    print('The number is odd')
```

The `__name__` value. If you execute the module itself, the `__name__` value will be `__main__`. And if you execute the file that using that module, the `__name__` will be the imported name of that module.
```python
# odd.py
def is_odd(number):
    return number % 2 != 0

print('__name__ = {0}'.format(__name__))

# If you execute the odd.py
python odd.py # it prints: __name__ = __main__

# If you execute the using odd.py
python using_odd.py # it prints: __name__ = odd
```

We can modify our module to let user execute the module itself by providing an argument via command line:
```python
def is_odd(number):
    return number % 2 != 0

if __name__ == '__main__':
    import sys
    number = int(sys.argv[1])
    if is_odd(number):
        print('{0} is odd.'.format(number))
    else:
        print('{0} is even.'.format(number))

# We can excecute this module like so
python odd.py 17 # it prints: 17 is odd.
```

We can have module with multiple functions:
```python
# person.py
def say_hello():
    print('Hello!')

def say_goodbye():
    print('Goodbye!')

# using_person.py
import person

person.say_hello() # Hello!
person.say_goodbye() # Goodbye!
```

If you just want to use the `say_goodbye()` function, you can selectively import that function only:
```python
from person import say_goodbye

say_goodbye() # Goodbye!
```

### Reading Files

Suppose you have this `people.csv` file
```csv
john,10,football
kirk,20,rowing
tina,30,tennis
```

You can read that file like this:
```python
# You can pass r(read), w(write), a(append)
# If none given, it will default to r(read)
csv = open('people.csv', 'r')

# Loop through each line in CSV
for line in csv:
    print(line)

# Eventhough it will be cleaned automatically by garbage collectror at some point
# It is a good practice to close the opened file to free memory
csv.close()
```

You can also do it like this. This way you don’t have to manually `close` the file, it will be automatically closed open exiting the block.
```python
with open('people.csv', 'r') as f:
    print(f.read())
```

You can use the built in `csv` module to read a CSV file:
```python
import csv

with open('people.csv', 'r') as f:
    people = csv.reader(f)
    for row in people:
        print('{0} is {1} years old and loves {2}'.format(row[0], row[1], row[2]))
```

Or if you have a JSON file like this:
```json
[
    {
        "name": "john",
        "age": 10,
        "sport": "football"
    },
    {
        "name": "kirk",
        "age": 20,
        "sport": "rowing"
    },
    {
        "name": "tina",
        "age": 30,
        "sport": "tennis"
    }
]
```

You can read it with the build in `json` module:
```python
import json

with open('people.json', 'r') as f:
    people = json.load(f)
    for person in people:
        print('{0} is {1} years old and loves {2}'.format(person['name'], person['age'], person['sport']))
```

### Writing to a File

```python
# Open a file with write mode.
f = open('cars.txt', 'w')

cars = ['ferari', 'tesla', 'volvo']

# Loop through each cars and write it to a file.
for car in cars:
    f.write(car + '\n')

# The writing is happened when close() is called. It will be implicityly called upon exiting the application
f.close()
```

You can also use the `with` block:
```python
cars = ['ferari', 'tesla', 'volvo']

with open('cars.txt', 'w') as f:
    for car in cars:
        f.write(car + '\n')
```

Writing to JSON file:
```python
import json

cars = [
    {'make': 'ferari'},
    {'make': 'tesla'},
    {'make': 'volvo'}
]

with open('cars.json', 'w') as f:
    json.dump(cars, f)
```

### Handling Exceptions

```python
# errors.py
import sys

try:
    print(int(sys.argv[1]) / int(sys.argv[2]))
except Exception as e:
    print('Something went wrong...')

# Test it with the following scenario
python errors.py 10 5 # 2.0
python errors.py 10 foo # 'Something went wrong...'
python errors.py 10 0 # 'Something went wrong...'
```

Rather than generally catch all type of exceptions, we can catch a specific exception type:
```python
import sys

try:
    print(int(sys.argv[1]) / int(sys.argv[2]))
except ValueError as e:
    print('You must enter a valid number.')
except ZeroDivisionError as e:
    print('You cannot divide by zero.')
```

### Scope

```python
def whoami():
    i = 'I am groot'

    def local_groot():
        # i is local to this local_groot scope
        i = 'I am local groot'
    
    def nonlocal_groot():
        # i comes from the outter scope (whoami scope)
        nonlocal i
        i = 'I am nonlocal groot'
    
    def global_groot():
        # i comes from the global scope
        global i
        i = 'I am global groot'

    print(i) # I am groot
    local_groot()
    print(i) # I am groot
    nonlocal_groot()
    print(i) # I am nonlocal groot
    global_groot()
    print(i) # I am nonlocal groot
    
whoami()
print(i) # I am global groot
```

### Classes

```python
# person.py
class Person():
    # The class attribute
    species = 'Homo Sapiens'

    def __init__(self, name, age=None):
        # The instance attributes
        self.name = name
        self.age = age
    
    def say_hi(self):
        if self.age is None:
            print('Hi, my name is {0}!'.format(self.name))
        else:
            print('Hi, my name is {0} and I am {1} years old.'.format(self.name, self.age))

# using_person.py
from person import Person

john = Person(name='John', age=27)
john.say_hi() # Hi, my name is John and I am 27 years old.

tim = Person(name='Tim')
tim.say_hi() #Hi, my name is Tim!

# Accessing the class attribute
print(Person.species) # Homo Sapiens
print(john.species) # Homo Sapiens
print(tim.species) # Homo Sapiens
```

Class can inherits another class:
```python
# person.py
class Programmer(Person):
	  # Override the Person say_hi() method
    def say_hi(self):
        print('I am {0} and I love python.'.format(self.name))

# using_person.py
from person import Person, Programmer

john = Person(name='John', age=27)
john.say_hi() # Hi, my name is John and I am 27 years old.

dan = Programmer(name='Dan', age=20)
dan.say_hi() # I am Dan and I love python.
```

### Managing Packages with pip

```bash
# Create new virtualenv named venv36 using python 3.6.3 version
pyenv virtualenv 3.6.3 venv36

# Set the current directory to use venv36
pyenv local venv36
```

```bash
# Install a package
pip install package

# Uninstall package
pip uninstall package

# Search for package
pip search package

# List the installed packages
pip list

# List outdated packages
pip list --outdated

# Freeze package requirements
pip freeze > requirements.txt

# Install from the requirements.txt
pip install -r requirements.txt
```

## Python Basics in Depth

A closer look at the fundamentals of the language: numbers, strings, lists and booleans.

### Python at a Glance

* The Python interpreter is easily extended with new functions and data types implemented in C or C++ (or other languages callable from C).
* Python is extensible: if you know how to program in C it is easy to add a new built-in function or module to the interpreter, either to perform critical operations at maximum speed, or to link Python programs to libraries that may only be available in binary form (such as a vendor-specific graphics library). 
* Statement grouping is done by indentation instead of beginning and ending brackets.
* No variable or argument declarations are necessary.
```python
is_awesome = True
if is_awesome:
	print("Awesome!")
```

### Numbers

* Division always returns a floating point number:
```python
10 / 2 # 5.0
10 / 6 # 1.6666666666666667
```

* Use `//` to discard fraction part. And `%` to get the reminder:
```python
10 // 2 # 5
10 // 6 # 1
10 % 2 # 0
10 % 6 # 4
```

* Use `**` to calculate power:
```python
2 ** 2 # 4
2 ** 4 # 16
```

* Use `=` to assign value to a variable
```python
width = 4
```

* If a variable is not “defined” (assigned a value), trying to use it will give you an error:
```python
>>> x
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'x' is not defined
```

* operators with mixed type operands convert the integer operand to floating point:
```python
(9 + 1) * 5.0 # 50.0
5 * 2 * 10.1 # 50.5
```

### Working with Strings

#### Quotes and Escaping

* String can be enclosed in single quotes `('...')` or double quotes `("...")`. The `\` can be used to escape a quote or a special character.
```python
print("hello world")
print('hello world')
print("it doesn't")
print('it doesn\'t')
print("they said \"yes!\"")
print('they said "yes!"')
```

* If you don’t want characters prefaced by `\` to be interpreted as special characters, you can use raw strings by adding an `r` before the first quote:
```python
print('C:\task') # \t is tab character: C:  ask
print(r'C:\task') # C:\task
```

#### Multiple Lines

* Enclose multiple lines string with triple-quotes: `"""..."""` or `'''...'''`. 
```python
print("""hello
world""")
```
Output:
```
hello
world
```
```python
print("""
hello
world
""")
```
Output: (notice the new line at the start and at the end.
```

hello
world

```
* Use `\` to remove the new-line:
```python
print("""\
hello
world\
""")
```
Output: (no empty new line)
```
hello
world
```

#### Concatenation

* Strings can be concatenated with the `+` operator, and repeated with `*`:
```python
print("hello" + " " + "world") # hello world
print("hello " * 2 + "world") # hello hello world
```

* Two or more string literals (i.e. the ones enclosed between quotes) next to each other are automatically concatenated.
```python
print("hello " "world") # hello world

# This feature is particularly useful when you want to break long strings:
text = ('hello '
		  'world!')

# This only works with two literals though, not with variables or expressions:
message = "hello"
print(message "world!") # SyntaxError: invalid syntax

print(("hello " * 2) "world") # SyntaxError: invalid syntax

# Use + operator to solve this:
print(message + "world!") # helloworld!
print(("hello " * 2) + "world") # hello hello world
```

#### Indexing and Slicing Strings

* Strings can be indexed (subscripted), with the first character having index 0.
```python
word = "Python"
word[0] # P
word[5] # n

# Indices may also be negative numbers, to start counting from the right:
word[-1] # n
word[-6] # P

# Attempting to use an index that is too large will result in an error:
word[1000] # IndexError: string index out of range
```

* In addition to indexing, slicing is also supported. While indexing is used to obtain individual characters, slicing allows you to obtain substring:
```python
word = "Python"
word[0:2]  # characters from position 0 (included) to 2 (excluded): Py
word[2:5] # tho

# Omitting first or last index
word[:3] # From the begining to 3 (excluded): Pyt
word[3:] # From position 3 to the end: hon
word[-2:] # From position -2 to the end: on
word[:] # Python

# out of range slice indexes are handled gracefully when used for slicing:
word[1:100] # ython
word[-100:2] # Py
```

#### Immutability and Length

* Python strings cannot be changed — they are immutable. Therefore, assigning to an indexed position in the string results in an error:
```python
word = "Python"
word[0] = "J" # TypeError: 'str' object does not support item assignment

# If you need a different string, you should create a new one:
"J" + word[1:] # Jython
```

* The built-in function `len()` returns the length of a string:
```python
word = "Python"
len(word) # 6
len("hello") # 5
```

### Working with Lists

#### Creating Lists

* List can be written as a list of comma-separated values (items) between square brackets. Lists might contain items of different types, but usually the items all have the same type.
```python
nums = [1, 10, 50, 100]
mixed = [1, "hello", 3.14]
```

#### Indexing and Slicing Lists

* lists can be indexed and sliced:
```python
nums = [1, 10, 50, 100]

nums[0] # 1
nums[3] # 100
nums[-1] # 100

nums[0:2] # [1, 10]
nums[1:3] # [10, 50]
nums[1:] # [10, 50, 100]
nums[:3] # [1, 10, 50]
nums[2:99] # [50, 100]
nums[-2:] # [50, 100]

# All slice operations return a new list containing the requested elements. This means that the following slice returns a new (shallow) copy of the list:
nums[:] # [1, 10, 50, 100]
```

#### Changing Lists

* Lists also support operations like concatenation:
```python
[1, 100] + [2, 100] # [1, 100, 2, 100]
```

* Unlike strings, which are immutable, lists are a mutable type, i.e. it is possible to change their content:
```python
nums = [1, 10, 50, 100]
nums[0] = 99 # nums = [99, 10, 50, 100]
```

* You can also add new items at the end of the list, by using the `append()` method:
```python
nums = [1, 10, 50, 100]
nums.append(99) # nums = [1, 10, 50, 100, 99]
```

* Assignment to slices is also possible, and this can even change the size of the list or clear it entirely:
```python
nums = [1, 2, 3, 4, 5]
nums[1:3] = ["foo", "bar"] # nums = [1, "foo", "bar", 3, 4, 5]

# The assigned list doesn't have to be the same length
nums = [1, 2, 3, 4, 5]
nums[1:3] = ["foo", "bar", "baz"] # nums = [1, 'foo', 'bar', 'baz', 4, 5]

nums = [1, 2, 3, 4, 5]
nums[1:3] = ["foo"] # nums = [1, 'foo', 4, 5]

# Adding new items in between
nums = [1, 2, 3, 4, 5]
nums[1:0] = ["foo", "bar"] # nums = [1, 'foo', 'bar', 2, 3, 4, 5]

# clear the list by replacing all the elements with an empty list
nums = [1, 2, 3, 4, 5]
nums[:] = []
```

* The built-in function `len()` also applies to lists:
```python
nums = [1, 2, 3, 4, 5]
len(nums) # 5
```

### Multiple Assignment

* Multiple assignment
```python
a, b = 10, 99 # a = 10; b = 99

a, b = 2 ** 4, 10 / 2 # a = 16; b = 5.0
```

### Booleans

* Boolean
```python
bool(True) # True
bool(False) # False

# 0 integer is False, other than that True
bool(0) # False
bool(1) # True
bool(200) # True
bool(-0) # False
bool(-1) # True
bool(-200) # True

# Apply to float too
bool(0.0) # False
bool(0.01) # True
bool(1.5) # True
bool(-0.0) # False
bool(-0.01) # True
bool(-1.5) # True

# 0 length string is False
bool("") # False
bool(" ") # True
bool("foo") # True

# 0 length list is False
bool([]) # False
bool([1]) # True
bool([0]) # True
```
