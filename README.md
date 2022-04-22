# semi-reactive
###### A small ES6 semi-reactive components library.
Semi-reactive is a **pure EcmaScript** implementation of **reactive components**. With it, you can easily create reactive components without any compilation or pre-processor process, just write and run on the browser.
###### Features and tools
- Create components with pure EcmaScript, no need to use Babel or compile
- Easily create modals, reactive-forms
- Small implementation of switches and routers
- Small implementation of observables

#
#### Adding semi-reactive to project
To add **semi-reactive** library to project, just use a ```script``` tag, passing the ```src``` property as the path to *semi-reactive/include.js* file and the properties ```component-file``` and ```target```, that are, respectively, the path to root component file (with ```export default```) and the selector of HTML element to put the component.

###### index.html
```HTML
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="<path>/main.js"></script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

###### main.js
```Javascript
import { SemiReactive } from '<semi-reactive-path>/main.js';
import AppComponent from '<components-path>/app-component.js';

SemiReactive.start({
  component: AppComponent,
  target: '#app'
});
```

#### Creating a component
To create a component, just import and extend the class Component or one of it subclasses
```Javascript
// Import the Component class from "core.js" file
const { Component } = await SemiReactive.import("core.js");

// Create the component from Component class
export default class MyComponent extends Component {
  // Always use constructor
  constructor() {
    // Always use super()
    super();
  }
  
  // The method render() return HTML content as string
  render() {
    return `
      <div>
        This is a simple component
      </div>
    `;
  }
}
```

#### Reactivity
To make reactive components, just pass an object with the pairs ```<property-name>: <initial-value>``` to Components' constructor with the observed properties, and the component will be re-renderized always one of it properties change the value.

```Javascript
const { Component } = await SemiReactive.import("core.js");

export default class MyReactiveComponent extends Component {
  constructor() {
    // Create property value
    super({
      value: 0
    });
  }
  
  // Increment the value of property value
  increment() {
    this.value ++;
  }
  
  render() {
    // Use "this.component" to refer to the self component inner HTML
    return `
      <div>
        Value: ${ this.value }
      </div>
      <button onclick="this.component.increment()">
        Increment value
      </button>
    `;
  }
}
```

#### Child components
To add children into a component, use the ```appendChild(component, selector)``` method

```Javascript
const { Component } = await SemiReactive.import("core.js");

// The component that will be put into the ParentComponent
class ChildComponent extends Component {
  constructor() {
    super();
  }
  
  render() {
    return `
      <div>
        This is the child component
      </div>
    `;
  }
}

// Root component
export default class ParentComponent extends Component {
  constructor() {
    super();
    // Instance the child component
    const component = new ChildComponent();
    // Append the child inner the <child-component> tag
    this.appendChild(component, "child-component");
  }
  
  render() {
    return `
      <div>
        This is the parent component
      </div>
      <child-component></child-component>
    `;
  }
}
```
