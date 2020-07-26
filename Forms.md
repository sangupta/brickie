# Forms

Brickie has special handling for `forms` and `form elements` as described below.
As `brickie` is react component framework agnostic, applications will need a one
time registeration of `form` and `element` components.

## Registering Form

Register the base `form` element with `Brickie`.

```js
// register that component wired with name "CustomForm" is our base `form` component.
// you can register more than one `form` level component. The name is the name used
// when registering component and not necessarily the name of `function` or `class`.
//
// the below does not provide any extra support other than base Brickie support. When
// an event is called (starting with `on`) it will be passed as other events to the
// callback handler.

Brickie.registerForm("CustomForm");
Brickie.registerForm("CustomFormWithTouchSupprt");

// However, Brickie provides support to aggregate form-data and pass it to the callback
// direcrly, to liberate callee from aggregating using `varstore`.
//
// see example below for details

Brickie.registerForm("CustomForm", "onSubmit"); 

// Brickie can also trap into multiple form event methods to provide the same support.
// In this case, you can pass a string array to register multiple method names

Brickie.registerForm("CustomForm", [ "onSubmit", "onFormSubmit" ]); 
```

The above will trap the `onSubmit` method in the `CustomForm`. It can be used with
custom callback handlers as under:

```html
<CustomForm onSubmit="formCallbackHandler" />
```

First the callback will be called for `formCallbackHandler` and the form data inside
this form will be provided to the callback method directly, so that they do not need
to struggle with `varstore`.

```js
// function based callback handler will receive the first argument as the name
// of handler that was invoked

function genericCallback(id, data) {
    switch(id) {
        case "formCallbackHandler":
            const formData = data;
            break;
        default:
            // other handlers
    }
}
```

```js
// class based callback handler. Brickie itself searches for a method in this class
// that has the same name as provided in JSON, and calls it

class MyCallbackInstance {
    function formCallbackHandler(formData) {
        
    }    
}
```
## Registering Form Elements

When registering form elements, `brickie` needs to know which `prop` method to
bind action to listen for changed values. This allows `brickie` to automatically
update the `varstore` update for you based on form elements.

Note, precedence is given to `name` attribute on form elements, followed by `id`
attribute. There is no way to override this behavior.

Consider the following React Component:

```js
export default class Textfield extends React.Component {

  handleChange(e) {
    this.props.onChange(e.target.value);
  }

  render() {
    return <input type="text" onChange={this.handleChange} value={this.state.value} />
  }
  
}

// The above component can be registered as below/
//
// trap `onChange` method to update the value of attribute

Brickie.registerFormElement("Textfield", "onChange"); 

// similar to form registeration, the 2nd argument can be 
// a string array to register callback method against multiple
// triggers that may be fired in different state.
// (not sure if component libraries do that)

Brickie.registerFormElement("Textfield", [ "onChange", "onUpdate" ]); 
```

But components may not always pass the form field value as the very first
argument to the method call. Thus, consider the below React Component:

```js
export default class TextArea extends React.Component {

  handleChange(e) {
    this.props.onChange(this.props.name, e.target.value);
  }

  render() {
    return <input type="text" onChange={this.handleChange} value={this.state.value} />
  }
  
}

// Such a component can be registered as:
//
// the second argument (0th-based) in method call will give value

Brickie.registerFormElement("TextArea", [ "onChange" ], 1); 
```

Components may even get trickier and supply the parent itself rather than
actual value in the `onChange` handler. Consider the below component:

```js
export default class ColorPicker extends React.Component {

  handleChange(e) {
    this.props.onChange(this.props.name, e);
  }

  render() {
    return <input type="text" onChange={this.handleChange} value={this.state.value} />
  }
  
}

// Such a component can be registered as:
//
// the second argument (0th-based) in method call will give object
// parse to read "target.value" to get the actual value to update in store

Brickie.registerFormElement("ColorPicker", [ "onChange" ], 1, "target.value"); 
```

## Form and `varstore` state

### Basic form

```html
<CustomForm>
    <Textfield name="firstName" />
    <Checkbox name="active" />
</CustomForm>
```

When elements above change, the store gets populated as:

```json
{
    "firstName" : "brickie",
    "active" : true
}
```

### Form with name/id example

```html
<CustomForm name="myForm">
    <Textfield id="firstName" />
    <Checkbox name="active" />
</CustomForm>
```

```json
{
    "myForm" : {
        "firstName" : "brickie",
        "active" : true
    }
}
```

### Form with aggregating component

```html
<CustomForm name="myForm">
    <Address id="billing" />
    
    <!-- note shipping will take precedence below -->
    <Address name="shipping" id="shippingAddress" />
</CustomForm>
```

```json
{
    "myForm" : {
        "billing" : {
            "line1" : "home, sweet home",
            "city" : "San Jose",
            "state" : "CA",
            "country" : "US",
            "zipCode" : 95110
        },
        "shipping" : {
            "line1" : "home, sweet home",
            "city" : "San Jose",
            "state" : "CA",
            "country" : "US",
            "zipCode" : 95110
        }
    }
}
```
