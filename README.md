# Brickie

Brickie is a JSON based layout renderer using React
components.

* [Brickie React Components](#brickie-react-components)
  * [Case Sensitivity](#case-sensitivity)
* [Usage](#usage)
  * [Key property](#key-property)
  * [Children](#children)
  * [Event handlers](#event-handlers)
* [Future Wishlist](#future-wishlist)
* [Inspiration](#inspiration)
* [Author](#author)
* [License](#license)

## Brickie React Components

`Brickie` does not ship with any React component. It was developed
with bring-your-own React component framework in mind. Thus, you
need to register components before you can start using them.

To register a single component:

```js
import Button from 'my-react-component-framework';

Brickie.registerBrick('Button', Button);
```

If you would like to register components in bulk, you can use
the convenience method as:

```js
import * as MyLib from 'my-react-component-framework';

Brickie.registerBricks(MyLib);
```

Currently, registering a component registers it will all
`Brickie` instances. However, this may change in future.

### Case-Sensitivity

Component names are case-sensitive by default. This behavior
may change in future.

## Usage

`Brickie` uses JSON to represent the UI components which are
built in React. 

### Key property

`Brickie` expects all bricks to contain a `key` property. This
allows for performant rendering. In case the calling application
does not provide a `key` property, `Brickie` will add one before
starting UI render.

### Children

Any primitive value (`string`, `number`, `boolean` or `bigint`)
specified as the value of `children` property in the UI layout
shall be rendered as is. For any other value type, `Brickie` will 
treat it as a brick.

### Event handlers

For attaching event handlers, one may pass a function or an object
instance to `Brickie` while rendering the UI. For attaching an
event handlers such as `onClick` or `onDoubleClick`, pass in a
`string` value.

If the callback provided is a `function`, then it will be supplied
the `string` identifier provided as the first argument to the method
call, with event arguments following.

If the callback provided is an `object` and has a `function` with
same name as `string` identifier, it will be invoked with the same
arguments of event handler.

## Future Wishlist

* Allow case insensitive brick names
* Allow registering components per `Brickie` instance

## Inspiration

`Brickie` is inspired by the following projects:

* [react-jsonschema-form](https://mozilla-services.github.io/react-jsonschema-form/)
* https://www.storyblok.com/tp/react-dynamic-component-from-json
* [Alibaba Formily](https://github.com/alibaba/formily)
* [Rendering React components from JSON data dynamically](https://stackoverflow.com/questions/48402815/rendering-react-components-from-json-data-dynamically)
* [Quick tutorial to build dynamic JSON based form](https://codeburst.io/reactjs-a-quick-tutorial-to-build-dynamic-json-based-form-a4768b3151c0)

## Author

* [Sandeep Gupta](https://sangupta.com)

## License

Apache License Version 2.0.