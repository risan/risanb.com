---
title: React Tutorial from Scratch
description: >
    Learn React step by step, from the raw React API and JSX, custom components, props validation,
    state, event handlers and refs, to forms, lists and HTTP requests.
date: 2017-12-06T10:00:00+02:00
categories: [tutorial]
tags: [javascript, react]
images: [/img/react.png]
---
{{<toc>}}

These are my notes from learning React. We start from the lowest level, the raw React API, and then build up to JSX, components, state, forms and HTTP requests. All the examples were written against React 16 (December 2017), loaded from unpkg, so there is no build step. Just save a snippet into an HTML file and open it in the browser.

## Hello World with Raw React API

Let's start with how we would dynamically create an element with vanilla JavaScript:

```html
<html>
<body>
  <div id="root"></div>
  <script>
    const rootElement = document.getElementById('root');

    const element = document.createElement('div');
    element.textContent = 'Hello World';
    element.className = 'container';

    rootElement.appendChild(element);
  </script>
</body>
</html>
```

Here is the same thing with React:

```html
<html>
<body>
  <div id="root"></div>
  <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
  <script>
    const rootElement = document.getElementById('root');

    const element = React.createElement('div', {
      className: 'container'
    }, 'Hello World');

    ReactDOM.render(element, rootElement);
  </script>
</body>
</html>
```

We can also pass the children as a property of the second argument:

```js
const element = React.createElement('div', {
  className: 'container',
  children: 'Hello World'
});
```

Note that we can pass as many children as we want:

```js
const element = React.createElement('div', {
  className: 'container',
}, 'Hello World', 'How are you today?');

// Equals with above code 👆🏻
const element = React.createElement('div', {
  className: 'container',
  children: [
    'Hello World',
    'How are you today?'
  ]
});
```

We can pass another React element as a child:

```js
const element5 = React.createElement('strong', {}, 'Foo Bar!');
const element6 = React.createElement('div', {
  className: 'container',
}, 'Hello World', element5);
```

## Use JSX with React

Composing elements with `createElement` is a tedious task, that's why we have JSX. To use it in the browser we need to add Babel standalone and set the script type to `text/babel`.

```html
<html>
<body>
  <div id="root"></div>

  <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>

  <script type="text/babel">
    const rootElement = document.getElementById('root');

    const element = <div className="container">Hello World</div>;

    ReactDOM.render(element, rootElement);
  </script>
</body>
</html>
```

It looks like XML:

```js
const element = <div className="container">Hello World</div>;
```

But it will eventually be compiled to JavaScript. You can test it here: [Babel REPL](https://babeljs.io/repl).

```js
React.createElement(
  "div",
  { className: "container" },
  "Hello World"
);
```

It doesn't have to be in one line:

```js
const element = <div className="container">
  Hello World
  How are you today?
</div>;
```

You can use curly braces to embed a JavaScript expression:

```js
const message = 'Hello World';
const element = <div className="container">{message}</div>;
```

You can pass any valid JavaScript expression:

```js
const content = { message: 'Hello World' };
const containerType = 'big';
const element3 = <div className={'container-' + containerType}>
    {content.message.toUpperCase()}
    {5 * 20}
</div>;
```

One common thing to do when working with JSX is passing a props object like this:

```js
const props = {
  className: 'container',
  children: 'Hello World'
};

const element = <div {...props} />;
```

With the given props, you can set a default value for an attribute by putting it on the left side:

```js
const props = {
  children: 'Hello World'
};

const element = <div className="my-class" {...props} />;
```

Or if you want to override the given props value, put the attribute on the right side:

```js
const props = {
  children: 'Hello World',
  className: 'container'
};

const element = <div {...props} className="my-class" />;
```

## Create Custom React Components

Since JSX is compiled into JavaScript, you can pass it within the curly braces of another JSX:

```js
const rootElement = document.getElementById('root');
const helloWorld = <div>Hello World</div>;
const element = <div className="container">
  {helloWorld}
  {helloWorld}
</div>;
```

You can also create a function that returns a JSX instance and call it within a JSX:

```js
const message = (props) => <div>{props.message}</div>;

const element2 = <div className="container">
  {message({ message: 'Hello World' })}
  {message({ message: 'How are you today?' })}
</div>;
```

You can return multiple lines of JSX like this:

```js
const message = (props) => {
  return <div>
    {props.message}
  </div>;
}
```

But if you want your JSX to start on a new line after the `return` keyword, you have to use parentheses:

```js
const message = (props) => {
  return (
    <div>
      {props.message}
    </div>
  );
}
```

Besides receiving the string of the HTML element that you want to create, `React.createElement` can also receive a function that returns a JSX. You can pass an argument to that function as the second parameter:

```js
const message = (props) => <div>{props.message}</div>;

const element = <div className="container">
  {React.createElement(message, { message: 'Hello World' })}
  {React.createElement(message, { message: 'How are you today?' })}
</div>;
```

Babel will compile the following JSX:

```js
const element = <message />;

// Into a javascript:
var element = React.createElement("message", null);
```

Babel treats `<message />` as an ordinary DOM element. But if you capitalize it as `<Message />`, Babel will treat it as a reference to the `Message` variable:

```js
const element = <Message />;

// Compiled into:
var element = React.createElement(Message, null);
```

With the above knowledge, we can capitalize our `message` function and simplify the `React.createElement` expression:

```js
const Message = (props) => <div>{props.message}</div>;

const element = <div className="container">
  <Message message="Hello World" />
  <Message message="How are you today?" />
</div>;
```

You can update the `Message` function to use the `children` property instead:

```js
const Message = (props) => <div>{props.children}</div>;

const element = <div className="container">
  <Message>Hello World</Message>
  <Message>How are you today?</Message>
</div>;
```

## Validate Custom React Component Props with PropTypes

When you create a custom React component, there's a possibility that you or someone else passes a wrong props value. So it's good practice to validate the given props.

```js
const SayHello = (props) => {
  return (
    <div>
      Hello, {props.firstName} {props.lastName}!
    </div>
  );
}

SayHello.propTypes = {
  // Validate the firstName property.
  firstName(props, propName, componentName) {
    if (typeof props[propName] !== 'string') {
      return new Error(`You must pass a string for ${propName} in ${componentName}. You passed ${typeof props[propName]} instead.`);
    }
  }
};

const element = <div>
  <SayHello firstName={true} />
</div>;
```

We can then refactor this code:

```js
const PropTypes = {
  string(props, propName, componentName) {
    if (typeof props[propName] !== 'string') {
      return new Error(`You must pass a string for ${propName} in ${componentName}. You passed ${typeof props[propName]} instead.`);
    }
  }
};

// Now it's simpler.
SayHello.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string
};
```

The good news is, React already provides a library for this: [prop-types](https://github.com/facebook/prop-types). Just import the library, and we can remove our own `PropTypes` object and the validation will still work:

```js
SayHello.propTypes = {
  firstName: PropTypes.string,
  lastName: PropTypes.string
};
```

However, as you may have noticed, even though we don't pass any `lastName` attribute, it doesn't generate any error. This is because `PropTypes` assumes that every property is optional. We can make them required like so:

```js
SayHello.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired
};
```

For a React component declared using a class, you can validate the props the same way:

```js
class SayHello extends React.Component {
  render() {
    const {firstName, lastName} = this.props;

    return (
      <div>
        Hello, {firstName} {lastName}
      </div>
    );
  }
}

SayHello.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired
};
```

But it's more common to define the `propTypes` as a static property of the class:

```js
class SayHello extends React.Component {
  static propTypes = {
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired
  };

  render() {
    const {firstName, lastName} = this.props;

    return (
      <div>
        Hello, {firstName} {lastName}
      </div>
    );
  }
}
```

Note that when you're using the production version of React, the `propTypes` won't spit out any error. They are only meant to be used during development. There's a Babel plugin to remove the `propTypes` from your production build: [babel-plugin-transform-react-remove-prop-types](https://github.com/oliviertassinari/babel-plugin-transform-react-remove-prop-types).

## Conditionally Render a React Component

We can conditionally render a React component like this:

```js
const Message = ({message}) => {
  if (!message) {
    return <div>No Message</div>
  }

  return <div>{message}</div>;
}

const element = <Message message={null} />
```

If the `message` property is empty, it will render `<div>No Message</div>` instead.

Since we know that we can pass a JavaScript expression within the curly braces, we can use the ternary operator to conditionally return a React element:

```js
const Message = ({message}) => {
  return (
    <div>
      {message
        ? React.createElement('div', null, message)
        : React.createElement('div', null, 'No Message')}
    </div>
  );
}
```

We can of course replace the `React.createElement` with the equivalent JSX:

```js
const Message = ({message}) => {
  return (
    <div>
      {message
        ? <div>{message}</div>
        : <div>No Message</div>}
    </div>
  );
}
```

## Rerender a React Application

Suppose you have a React element that displays the current time:

```js
const rootElement = document.getElementById('root');
const time = new Date().toLocaleTimeString();
const element = <div>Time <input type="text" value={time} /></div>;
ReactDOM.render(element, rootElement);
```

The problem is you have to refresh the browser to get the latest time. To solve this you can wrap the code within a function and use `setInterval`:

```js
function tick() {
  const time = new Date().toLocaleTimeString();
  const element = <div>It's <input type="text" value={time} /></div>;
  ReactDOM.render(element, rootElement);
}

setInterval(tick, 1000);
```

If you run the above code, the displayed time will be updated every second. Head over to the developer tools and open the *Elements* tab. You can see that React efficiently updates the `value` attribute only and does not re-render the whole `root` element. Even if you place multiple `input` elements like this, React will update the necessary parts only and even keep your focus.

```js
function tick() {
  const time = new Date().toLocaleTimeString();
  const element = <div>
    <div>It's <input type="text" value={time} /></div>
    <div>It's <input type="text" value={time} /></div>
  </div>;
  ReactDOM.render(element, rootElement);
}
```

It will be a different story if we update the DOM by setting the `innerHTML` property:

```js
function tick() {
  const time = new Date().toLocaleTimeString();
  const element = `<div>
    <div>It's <input type="text" value=${time} /></div>
    <div>It's <input type="text" value=${time} /></div>
  </div>`;

  rootElement.innerHTML = element;
}
```

The entire `root` element will be updated and you're going to lose your focus on every update.

Normally you'll never do a full application re-render every second like in the example above. React provides other ways to re-render parts of your application. This is just to show you how efficiently React handles DOM updates. It only updates the parts that need to be updated, which makes our application perform better.

## Style React Component

To style your React component, pass an object that represents the CSS to the `style` attribute. The CSS properties must be written in camel case. Passing `20` as an integer is the same as passing `'20px'` as a string.

```js
const element = <div>
  <div style={{ padding: 20, backgroundColor: 'beige' }}>box</div>
</div>;
```

Let's say we have the following CSS rules for a box:

```css
.box {
  border: 1px solid #000;
}

.box-small {
  padding: 10px;
}

.box-medium {
  padding: 20px;
}

.box-large {
  padding: 40px;
}
```

We can further style our box like this:

```js
const element = <div>
  <div
    className="box box-small"
    style={{ backgroundColor: 'beige' }}
  >
    box
  </div>
</div>;

// Organize it into props
const props = {
  className: 'box box-small',
  style: { backgroundColor: 'beige' }
};

const element = <div>
  <div {...props}>
    box
  </div>
</div>;
```

Let's turn our box into a component:

```js
const Box = (props) => {
  return (
    <div
      className="box box-small"
      style={{textTransform: 'uppercase', fontWeight: 'bold'}}
      {...props}
    />
  );
}

const element = <div>
  <Box style={{ backgroundColor: 'beige' }}>Small Box</Box>
</div>;
```

You might notice that our `textTransform` and `fontWeight` CSS rules are overridden by the `backgroundColor`. To solve this, we need to destructure the `props`, extract the given `style` property, then merge it with our internally defined style.

```js
const Box = ({style, ...rest}) => {
  return (
    <div
      className="box box-small"
      style={{textTransform: 'uppercase', fontWeight: 'bold', ...style}}
      {...rest}
    />
  );
}
```

Let's allow the user to pass the box size class name:

```js
const Box = ({style, className, ...rest}) => {
  return (
    <div
      className={`box ${className}`}
      style={{textTransform: 'uppercase', fontWeight: 'bold', ...style}}
      {...rest}
    />
  );
}

const element = <div>
  <Box
    className="box-small"
    style={{ backgroundColor: 'beige' }}
  >
    Small Box
  </Box>
</div>;
```

Note that with the above approach, when the user doesn't pass the `className` property, the element's class name would be `box undefined`. To solve this we can set a default value for `className`:

```js
const Box = ({style, className='', ...rest}) => {
  ...
}
```

We can refactor it further by providing a `size` property to determine the size related class name:

```js
const Box = ({style, size, className='', ...rest}) => {
  const sizeClassName = size ? `box-${size}` : '';

  return (
    <div
      className={`box ${sizeClassName} ${className}`}
      style={{textTransform: 'uppercase', fontWeight: 'bold', ...style}}
      {...rest}
    />
  );
}

const element = <div>
  <Box size="small" style={{ backgroundColor: 'beige' }}>
    Small Box
  </Box>
  <Box size="medium" style={{ backgroundColor: 'pink' }}>
    Medium Box
  </Box>
  <Box size="large" style={{ backgroundColor: 'orange' }}>
    Large Box
  </Box>
</div>;
```

Also note that the values passed to the `style` property are not vendor prefixed.

## Use Event Handlers with React

Event handlers are passed as props such as `onClick` and `onChange`. Here is a small app with a hand-made `setState` function that merges the new state and re-renders the whole app:

```js
let state = { eventCount: 0, text: '' };

function App() {
  return (
    <div>
      <p><button onClick={increment}>Trigger Event</button></p>
      <p>There have been <strong>{state.eventCount}</strong> events</p>
      <p><input onChange={updateText} /></p>
      <p>You typed: <strong>{state.text}</strong></p>
    </div>
  );
}

// Called when onClick is triggered
function increment() {
  setState({eventCount: state.eventCount + 1});
}

// Called when onChange is triggered
function updateText(event) {
  setState({text: event.target.value});
}

function setState(newState) {
  // Merge the state with the new state.
  Object.assign(state, newState);
  // Re-render the app.
  renderApp()
}

function renderApp() {
  ReactDOM.render(<App />, document.getElementById('root'));
}

renderApp();
```

You can access the native event object like this:

```js
function updateText(event) {
  console.log(event.nativeEvent); // Get the native event
  ...
}
```

The great thing is React optimizes this for us by using event delegation. There is only one event handler for each event type on the entire document, and it takes care of calling our event handler.

## Use Component State with React

In this section we'll build a stopwatch component that maintains its own state. We'll start by creating the static UI, then take the dynamic parts and accept them as props. After that we'll refactor them into state and add event handlers to update the state.

A static `StopWatch` component with `props`:

```js
function StopWatch({lapse, running}) {
  return (
    <div className="stopwatch">
      <div className="stopwatch-lapse">{lapse}ms</div>
      <div>
        <button className="stopwatch-btn">{running ? 'Stop' : 'Start'}</button>
        <button className="stopwatch-btn">Clear</button>
      </div>
    </div>
  );
}

const element = <StopWatch lapse={10} running={true} />;

ReactDOM.render(element, document.getElementById('root'));
```

A dynamic `StopWatch` component with `state`:

```js
class StopWatch extends React.Component {
  initialState = {lapse: 0, running: false};
  state = this.initialState;

  handleStartStopClick = () => {
    this.setState(state => ({running: !state.running}), () => {
      if (this.state.running) {
        // running updated to TRUE, start the stopwatch!
        const startTime = new Date() - this.state.lapse;

        this.timer = setInterval(() => {
          this.setState(() => ({lapse: new Date() - startTime}));
        });
      } else {
        // running updated to FALSE, stop the stopwatch!
        clearInterval(this.timer);
      }
    });
  }

  handleClearClick = () => {
    clearInterval(this.timer);
    this.setState(this.initialState);
  }

  render() {
    const {lapse, running} = this.state;

    return (
      <div className="stopwatch">
        <div className="stopwatch-lapse">{lapse}ms</div>
        <div>
          <button className="stopwatch-btn" onClick={this.handleStartStopClick}>{running ? 'Stop' : 'Start'}</button>
          <button className="stopwatch-btn" onClick={this.handleClearClick}>Clear</button>
        </div>
      </div>
    );
  }
}
```

## Stop Memory Leaks with componentWillUnmount Lifecycle Method

Our stopwatch has a timer that keeps running. Let's see what happens when the component goes away. We'll add a checkbox to show or hide the previous `StopWatch` component:

```js
class App extends React.Component {
  state = {showStopWatch: true}

  handleOnChange = () => {
    this.setState(({showStopWatch}) => ({showStopWatch: !showStopWatch}))
  }

  render() {
    const {showStopWatch} = this.state;

    return (
      <div>
        <label>
          <input
            type="checkbox"
            checked={showStopWatch}
            onChange={this.handleOnChange}
          />
          <span>{showStopWatch ? 'Hide' : 'Show'} stopwatch</span>
        </label>
        <hr />
        {showStopWatch ? <StopWatch /> : null}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
```

Then we'll provide a callback when updating the `lapse` state:

```js
this.setState(() => ({lapse: new Date() - startTime}), () => {
  console.log('Lapse updated: ', this.state.lapse);
});
```

Now, if you start the stopwatch, the `lapse` value will be printed to the console until you hit stop. The issue is, when we start the stopwatch and then hide it with our new checkbox, we get a warning. This happens because our code still tries to update the `lapse` state even though the `StopWatch` component is already unmounted.

To solve this we'll use the `componentWillUnmount` method to clear the timer:

```js
class StopWatch extends React.Component {
  ...
  componentWillUnmount() {
    clearInterval(this.timer);
  }
  ...
}
```

## Use Class Components with React

Take a look at this basic `Counter` component:

```js
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
  }

  render() {
    return (
      <button onClick={() => this.setState(({count}) => ({count: count + 1}))}>
        {this.state.count}
      </button>
    );
  }
}
```

Now if you extract the `onClick` handler into its own method, you'll get an error when clicking on the button:

```js
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
  }

  handleClick() {
    this.setState(({count}) => ({
      count: count + 1
    }))
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.count}
      </button>
    );
  }
}
```

This happens because `this` within the `handleClick` method is no longer bound to the `Counter` instance. This is how `this` behaves in plain JavaScript:

```js
window.name = 'Windu';

const bob = {
  name: 'Bob',
  greet: function() {
    console.log(`Hello my name is ${this.name}`);
  }
};

bob.greet(); // Hello my name is Bob

// Store the greet() method to const
const greetFn = bob.greet;
greetFn(); // Hello my name is Windu
```

There are a number of ways to get around this issue.

### 1. Bind the function reference to the current instance

```js
<button onClick={this.handleClick.bind(this)}>
  {this.state.count}
</button>
```

### 2. Bind the prototypal method in the constructor

The above solution still has a performance bottleneck, since it creates a new function on every render. We can move the binding to the constructor instead:

```js
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
    this.handleClick = this.handleClick.bind(this);
  }
  ...
  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.count}
      </button>
    );
  }
}
```

### 3. Use public class properties

Though the above solutions work, we can still do better by using class properties:

```js
class Counter extends React.Component {
  state = {count: 0}

  handleClick = function() {
    this.setState(({count}) => ({
      count: count + 1
    }))
  }.bind(this);

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.count}
      </button>
    );
  }
}
```

### 4. Use arrow function

Finally, we can turn our `handleClick` into an arrow function:

```js
class Counter extends React.Component {
  state = {count: 0}

  handleClick = () => {
    this.setState(({count}) => ({
      count: count + 1
    }))
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.count}
      </button>
    );
  }
}
```

## Manipulate the DOM with React refs

Often you'll find there's a jQuery plugin or JavaScript library which needs access to DOM nodes to work in your application. Other times you need access to the DOM node directly to get the value of form fields or for other reasons. This is where React's `ref` prop comes in.

Let's use the `ref` prop to get access to the native DOM node and instantiate the vanilla-tilt library:

```html
<html>
<head>
  <script src="https://unpkg.com/react@16/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/vanilla-tilt@1.4.1/dist/vanilla-tilt.js"></script>
<style>
body {
  font-family: Menlo;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tilt-root {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #ff00ba 0%, #fae713 100%);
  transform-style: preserve-3d;
}

.tilt-child {
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
  padding: 10px;
  background: linear-gradient(150deg, #5a00ff 0%, #ff1ff7 100%, #ff1ff7 100%);
  transform: translateZ(40px);
  box-shadow: 0 0 50px 0 rgba(51, 51, 51, 0.3);
}
</style>
</head>
<body>
  <div id="root"></div>

<script type="text/babel">

class Tilt extends React.Component {
  componentDidMount() {
    // Refers to the native div DOM object.
    console.log(this.tiltRoot);

    VanillaTilt.init(this.tiltRoot, {
      max: 45,
      speed: 200,
      glare: true,
      'max-glare': 0.3
    });
  }

  render() {
    return (
      <div className="tilt-root" ref={node => this.tiltRoot = node}>
        <div className="tilt-child" {...this.props} />
      </div>
    );
  }
}

class App extends React.Component {
  componentDidMount() {
    // Refers to the Tilt component instance instead.
    console.log(this.tilt);
  }

  render() {
    return (
      <Tilt ref={node => this.tilt = node}>
        <div>Hello World 🌏</div>
      </Tilt>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
</script>
</body>
</html>
```

Note that if you use the `ref` prop on a React component, it will refer to the component instance instead of the DOM object.

## Make Basic Forms with React

Let's see how to use the `onSubmit` event to prevent the default submit behavior of a form, and then how to use that event to get the values from the form. We can also use the `ref` prop to get the value of form elements.

```js
class MyFrom extends React.Component {
  handleSubmit = (event) => {
    event.preventDefault();
    // Use the input index
    console.log('Username: ', event.target[0].value);
    // Use the input name
    console.log('Username: ', event.target.elements.username.value);
    // Use the ref props
    console.log('Username: ', this.usernameNode.value)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Username
          <input type="text" name="username" ref={node => this.usernameNode = node} />
        </label>
        <button type="submit">Submit</button>
      </form>
    );
  }
}

ReactDOM.render(<MyFrom />, document.getElementById('root'));
```

## Make Dynamic Forms with React

Next, let's use the `onChange` prop on an input to do dynamic and custom validation of the form as the user makes changes to the input.

```js
class MyFrom extends React.Component {
  state = {error: this.props.getErrorMessage('')};

  handleSubmit = (event) => {
    event.preventDefault();
    console.log('Username: ', this.usernameNode.value);
  }

  handleOnChange = (event) => {
    this.setState({error: this.props.getErrorMessage(event.target.value)})
  }

  render() {
    const {error} = this.state;

    return (
      <form onSubmit={this.handleSubmit}>
        <div>Username:</div>
        <div>
          <input type="text"
            onChange={this.handleOnChange}
            ref={node => this.usernameNode = node}
          />
        </div>
        {error ? <p style={{color: 'red'}}>{error}</p> : null}
        <button type="submit" disabled={Boolean(error)}>Submit</button>
      </form>
    );
  }
}

const element = (
  <MyFrom getErrorMessage={value => {
    if (value.trim().length < 6) {
      return 'The username must be at least 6 characters long.';
    }

    if (! (/^[a-zA-Z0-9_]+$/).test(value)) {
      return 'The username must only contain alphanumeric or underscore.';
    }

    return null;
  }} />
);


ReactDOM.render(element, document.getElementById('root'));
```

## Controlling Form Values with React

Now let's control the value of inputs, textareas and select elements. We manage the state ourselves while still allowing the user to update the values.

When binding the input's `value` attribute to the `state`, we have to handle the input changes ourselves by updating the related state property. In this example, the three fields always show the same list of cars in different formats.

```js
class MyFrom extends React.Component {
  static cars = [
    'audi',
    'bmw',
    'ferari',
    'honda',
    'renault',
    'tesla',
    'volvo',
  ];

  state = {separatedList: '', multiLines: '', multipleOptions: []};

  handleSeparatedList = (event) => {
    const {value} = event.target;
    const items = value.split(',')
      .map(value => value.trim())
      .filter(Boolean);

    this.setState({
      separatedList: value,
      multiLines: items.join('\n'),
      multipleOptions: items
    });
  }

  handleMultiLines = (event) => {
    const {value} = event.target;
    const items = value.split('\n')
      .map(value => value.trim())
      .filter(Boolean);

    this.setState({
      separatedList: items.join(','),
      multiLines: value,
      multipleOptions: items
    });
  };

  handleMultipleOptions = (event) => {
    const selectedOptions = Array.from(event.target.selectedOptions);
    const items = selectedOptions.map(option => option.value);

    this.setState({
      separatedList: items.join(','),
      multiLines: items.join('\n'),
      multipleOptions: items
    });
  }

  render() {
    const {cars} = MyFrom;
    const {separatedList, multiLines, multipleOptions} = this.state;

    return (
      <form>
        <div>Comma Separated List</div>
        <input type="text" value={separatedList} onChange={this.handleSeparatedList} />
        <div>Multiple Lines</div>
        <textarea rows={cars.length} value={multiLines} onChange={this.handleMultiLines} />
        <div>Multiple Select</div>
        <select multiple size={cars.length} value={multipleOptions} onChange={this.handleMultipleOptions}>
          {cars.map(car => (
            <option key={car} value={car}>{car}</option>
          ))}
        </select>
      </form>
    );
  }
}

const element = (
  <MyFrom />
);


ReactDOM.render(element, document.getElementById('root'));
```

## Use the key prop when Rendering a List with React

JSX is simply JavaScript, so to render a list you can use the array method `map` to map an array to React elements. However, if you don't use the `key` prop correctly, it can lead to unexpected results.

```js
const cars = [
  {id: 1, make: 'audi'},
  {id: 2, make: 'ferari'},
  {id: 3, make: 'honda'},
  {id: 4, make: 'tesla'},
  {id: 5, make: 'volvo'},
];

function CarList() {
  return (
    <ul>
      {cars.map(car => (
        <li>{car.make}</li>
      ))}
    </ul>
  );
}

const element = (
  <CarList />
);

ReactDOM.render(element, document.getElementById('root'));
```

If you run the above code, even though it works fine, you'll get a warning in the console:

```
Warning: Each child in an array or iterator should have a unique "key" prop.
```

To fix this, you need to pass a unique `key` prop to each array item:

```js
<ul>
  {cars.map(car => (
    <li key={car.id}>{car.make}</li>
  ))}
</ul>
```

By providing the `key`, React can track each individual element. This is really important when the list is dynamic. With the provided key, React can efficiently and correctly re-render when the list changes.

## Make HTTP Requests with React

To finish, let's make an HTTP request. This example loads a GitHub profile through the GitHub GraphQL API using [axios](https://github.com/axios/axios), and [Lodash](https://lodash.com/)'s `debounce` so we don't send a request on every keystroke. Both libraries need to be loaded on the page, and you need to replace `TOKEN_HERE` with your own GitHub access token.

```js
class App extends React.Component {
  state = {loading: true, username: 'risan', avatarUrl: undefined, bio: undefined};

  constructor(props) {
    super(props);

    this.loadGithubProfileDebounced = _.debounce(this.loadGithubProfile, 2000);
  }

  componentDidMount() {
    this.loadGithubProfile();
  }

  loadGithubProfile() {
    this.setState({loading: true});

    axios.post('https://api.github.com/graphql', {
      query: `{
        user(login: "${this.state.username}") {
          bio, avatarUrl
        }
      }`
    }, {
      headers: {
        Authorization: 'bearer TOKEN_HERE'
      }
    }).then(response => {
      this.setState({...response.data.data.user, loading: false});
    });
  }

  handleChange = (e) => {
    this.setState({ username: e.target.value}, this.loadGithubProfileDebounced);
  }

  render() {
    return (
      <div>
        <input type="text" value={this.state.username} onChange={this.handleChange} />
        <GithubProfile {...this.state} />
      </div>
    );
  }
}

function GithubProfile({username, avatarUrl, bio, loading}) {
  return loading ? (
    <div className="github-profile">
      <p className="github-profile-bio">
        Loading <strong>@{username}</strong>...
      </p>
    </div>
  ) : (
    <div className="github-profile">
      <img className="github-profile-avatar" src={avatarUrl} />
      <p className="github-profile-bio">
        <strong>@{username}</strong><br />
        {bio}
      </p>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```
