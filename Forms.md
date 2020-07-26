# Forms

Brickie has special handling for `forms` and `form elements` as described below.
As `brickie` is react component framework agnostic, applications will need a one
time registeration of `form` and `element` components.

## Registering Form

Register the base `form` element with `Brickie`.

```js
// the 2nd argument is optional and the default value will be empty array
Brickie.registerForm("CustomForm", [ "onSubmit" ]); 
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
// the 2nd argument is provided as an array in case the form element
// triggers different action methods on different state.
// 
// Not sure if components do that

Brickie.registerFormElement("Textfield", [ "onChange" ]); 
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

## Basic Form example

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

## Form with name/id example

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
