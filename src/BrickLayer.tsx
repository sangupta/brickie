import * as React from 'react';
import Bricks from './Bricks';
import { SPECIAL_BRICKS } from './Bricks';

import BrickUtils from './BrickUtils';
import BrickConfig from './BrickConfig';

import VarStore from 'varstore';
import FormConfig from './FormConfig';

import { getExistsWithValue } from 'varstore/src/VarStoreUtils';
import HandlerConfig from './HandlerConfig';
import ProxyBrick from './components/ProxyBrick';
import Brickie from './Brickie';

const BRICK_WITH_EXPR_IDENTIFIER = "__expr";

/**
 * Defines the `props` for `BrickLayer` 
 * component.
 */
interface BrickLayerProps {

    /**
     * The JSON layout that is rendered
     */
    layout: object;

    /**
     * Use this prefix instead of the default one when
     * generating unique keys for each brick
     */
    keyPrefix?: string;

    /**
     * State to be used to render
     */
    store: VarStore;

    /**
     * The callback handler that will be used to
     * pass event calls
     */
    callbackHandler?: Function | object;

}

/**
 * `BrickLayer` - React component for laying out
 * all the bricks and creating the magic.
 */
export default class BrickLayer extends React.Component<BrickLayerProps, {}> {

    /**
     * An identifier counter to generate unique keys
     */
    private idCounter: number = 0;

    /**
     * Handler cache to speed up re-rendering cycles
     */
    private handlerCache: Map<string, Function> = new Map();

    /**
     * Constructor
     * 
     * @param props 
     * @param context 
     */
    constructor(props, context) {
        super(props, context);

        // massage the JSON to be used
        if (props.layout) {
            Brickie.debug('requesting addition of key fields');

            this.addKeyFields(props.layout);

            Brickie.debug('layout generated: ', props.layout);
        }
    }

    /**
     * Render the UI.
     * 
     */
    render() {
        const layout = this.props.layout;
        if (!layout) {
            return null;
        }

        const rendered = this.renderLayout(layout, this.props.store);
        Brickie.debug('completed rendering...');
        return rendered;
    }

    /**
     * Render the layout using JSON structure created by `Brickie`.
     * 
     * @param layout 
     */
    renderLayout = (layout: any, store: VarStore): any => {
        if (Array.isArray(layout)) {
            let result = [];
            for (let index = 0; index < layout.length; index++) {
                let rendered = this.renderBrick(layout[index], store);
                if (rendered) {
                    result.push(rendered);
                }
            }

            return result;
        }

        return this.renderBrick(layout, store);
    }

    // /**
    //  * Get brick component corresponding to the given name of the
    //  * brick.
    //  * 
    //  * @param brickName the brick name to find the component for
    //  * 
    //  * @returns a React component for the given brick name, or `null`
    //  * if no matching component is found
    //  */
    // getBrick(brickName: string): BrickConfig {
    //     if (!brickName) {
    //         return null;
    //     }

    //     return Bricks.brickMappings[brickName];
    // }

    /**
     * Render the internal `Brickie` components for components
     * like `for` or `if`. These methods get access to this
     * `Brickie` internal method to manipulate the UI. The method
     * is invoked by these special bricks to render children by
     * the framework, using additonal context.
     *  
     * @param kids the JSON array of elements to be rendered
     * 
     * @param context the `object` to be used as additional context
     * when rendering. The context is pushed to `varstore` and then
     * the kids are rendered.
     */
    private renderKids = (kids: [], store:VarStore, context: VarStore = null): any => {
        // add context to current store
        const myStore = !!context ? store.fork('forked', context) : store;

        const result = this.renderLayout(kids, myStore);

        // remove context from store
        // if (context) {
        //     store.popContext();
        // }

        return result;
    }

    /**
     * Render a single brick.
     * 
     * @param brickJSON the brick definition to render (as JSON)
     */
    renderBrick = (brickJSON: any, store: VarStore): any => {
        if (!brickJSON) {
            return null;
        }

        if (BrickUtils.isPrimitive(brickJSON)) {
            return brickJSON;
        }

        const brickName: string = brickJSON.brick;
        if (!brickName) {
            Brickie.debug('Brick name has not been specified');
            return null;
        }

        // check for special cases of bricks
        const lowerBrickName: string = brickName.toLowerCase();
        let brickConfig: BrickConfig = SPECIAL_BRICKS[lowerBrickName];

        // check for special brick case
        const specialBrick: boolean = brickConfig ? true : false;
        if (brickConfig) {
            Brickie.info('found special brick as: ' + lowerBrickName);
        } else {
            // this is a normal brick (React component) - handle it normally
            brickConfig = Bricks.getBrick(brickName);
        }

        // check if the brick is registered or not
        let elementCtor: any;
        if (brickConfig) {
            elementCtor = brickConfig.brickCtor as any;
        } else {
            const chr = (brickJSON.brick as string).charAt(0);
            if(chr !== chr.toLowerCase()) {
                Brickie.warn('No brick found for given name: ', brickJSON.brick);
            }

            // this may be a standard HTML tag
            // let's just wire it up and return
            elementCtor = brickJSON.brick;
        }

        if (!elementCtor) {
            Brickie.error('No constructor to construct element with JSON: ', brickJSON);
            return null;
        }

        // check if this brick has expressions
        // if yes, we need to proxy this brick
        if (brickJSON[BRICK_WITH_EXPR_IDENTIFIER]) {
            const exprFields: string[] = brickJSON[BRICK_WITH_EXPR_IDENTIFIER];

            // yes, this is a brick with expressions
            // let's proxy it
            // get all static props
            const staticProps: any = {};
            this.copyBrickProperties(staticProps, brickJSON, store, exprFields.concat(BRICK_WITH_EXPR_IDENTIFIER));

            // get all dynamic props
            const dynamicProps: any = {};
            exprFields.forEach(field => {
                let x: string = brickJSON[field];
                dynamicProps[field] = x.substr(1, x.length - 2);
            });

            Brickie.debug('proxy json: ', brickJSON);

            /// build props
            const proxyProps: any = {};
            if (specialBrick) {
                proxyProps.renderKids = this.renderKids;
                staticProps.renderKids = this.renderKids;
                staticProps.store = store;
            }

            proxyProps.key = brickJSON.key + '-proxy';
            proxyProps.element = elementCtor;
            proxyProps.staticProps = staticProps;
            proxyProps.dynamicProps = dynamicProps;
            proxyProps.store = this.props.store;
            proxyProps.childBricks = brickJSON.children;

            return React.createElement(ProxyBrick, proxyProps, null);
        }

        // create an object instance of the component that we have
        const props: any = {};

        // copy brick properties.
        this.copyBrickProperties(props, brickJSON, store);
        props.key = brickJSON.key; // add ID prop


        if (props.style) {
            props.style = BrickLayer.convertStyleToObject(props.style);
        }

        if (specialBrick) {
            props.renderKids = this.renderKids;
            props.store = store;
        }

        // remove children - as they are passed via React.createElement
        delete props['children']; // delete children object

        // check if we have children
        const childBricks = brickJSON.children;
        let children = null;

        if (childBricks) {
            if (BrickUtils.isPrimitive(childBricks)) {
                if (typeof childBricks === 'string') {
                    children = this.evaluateExpression(childBricks, store);
                } else {
                    children = childBricks;
                }
            } else {
                children = this.renderLayout(brickJSON.children, store);
            }
        }

        // create the element
        // Brickie.warn('applying props: ', JSON.stringify(props));
        // Brickie.warn('applying children: ', JSON.stringify(children));
        Brickie.debug('creating react element for: ', elementCtor);
        const element = React.createElement(elementCtor, props, children);

        // return it
        return element;
    }

    /**
     * Convert a string based `style` attribute to an object
     * that React expects.
     * 
     * @param styles 
     */
    static convertStyleToObject(styles: string): object {
        Brickie.debug('styles type: ', typeof styles);

        const styleObject: any = {};
        if (!styles) {
            return {};
        }
        const items: string[] = styles.split(';');
        items.forEach(item => {
            const params: string[] = item.split(':');
            if (params.length == 2) {
                let key: string = params[0].trim();
                let updatedKey = '';
                // remove hyphen and convert next char to upper case
                let convert: boolean = false;
                for (let index: number = 0; index < key.length; index++) {
                    let chr = key.charAt(index);
                    if (chr === '-') {
                        convert = true;
                        continue;
                    }

                    if (convert) {
                        chr = chr.toUpperCase();
                        convert = false;
                    }

                    updatedKey += chr;
                }

                Brickie.debug('key ' + key + ' converted to ' + updatedKey);

                styleObject[updatedKey] = params[1].trim();
            }
        });

        Brickie.debug('style object generated as: ', styleObject);
        return styleObject;
    }

    /**
     * Method to copy all brick properties to the `prop`s
     * for the React component.
     * 
     * We cannot just blindly copy all props
     * like `Object.assign(props, brickConfig);`
     * any handler directly for that shall not
     * work. thus for any prop that starts with
     * `on` we will convert that to a handler of
     * ours that we shall use to pass.
     * 
     * @param props the `props` object to be used with the 
     * React component
     * 
     * @param brickConfig the brick definition as specified in the
     * JSON array
     * 
     * @param skipProps the `prop` names that need to be skipped.
     * These properties will be copied in a different way.
     * 
     */
    private copyBrickProperties(props: any, brickConfig: any, store:VarStore, skipProps: string[] = []): void {
        Brickie.debug('Processing properties for brick: ', brickConfig.brick);

        // find all keys inside configuration
        const keys: string[] = Object.keys(brickConfig) || [];

        // check if this is a form element
        const formElementConfig: FormConfig = Bricks.formElementMappings[brickConfig.brick];
        if (formElementConfig) {
            // if yes, add form element handlers to the keys
            // so that the code below can bind them to
            let formElementKeys: string[] = Object.keys(formElementConfig.handlers);
            formElementKeys.forEach(element => {
                if (!keys.includes(element)) {
                    keys.push(element);
                }
            });
        }

        // check if we have keys to bind to
        if (!keys || keys.length === 0) {
            // no prop is supplied, nothing to set
            return;
        }

        // iterate over all props in config
        for (let index = 0; index < keys.length; index++) {
            // read both prop and its value
            // also change any 'class' prop to 'className'
            // as that is what React understands
            const originalKey: string = keys[index];
            const key: string = originalKey !== 'class' ? originalKey : 'className';
            const value = brickConfig[originalKey];

            // we do not copy the brick prop
            if (key === 'brick') {
                continue;
            }

            // no need to copy if there is no value for prop
            if (!value) {
                continue;
            }

            // log a debug message
            Brickie.debug('    checking prop: ', key);

            // skip key if it is not needed
            if (skipProps.includes(key)) {
                Brickie.debug('    skipping expr key: ' + key + ' on brick: ' + brickConfig.brick)
                continue;
            }

            // is this a form key
            const isFormKey: boolean = formElementConfig && !!formElementConfig.handlers[key];
            Brickie.debug('    key is not a form key: ', key);

            // is the value a function back in the JSON itself
            // mount it directly, nothing to massage here
            if (!isFormKey && typeof value !== 'string') {
                Brickie.debug('    value is non-string, assigning directly: ', key);
                props[key] = value;
                continue;
            }

            // does prop start with `on` - it must be a handler
            if (!key.startsWith('on')) {
                Brickie.debug('    key is not a handler key: ', key);
                try {
                    props[key] = this.evaluateExpression(value, store);
                } catch(e) {
                    Brickie.warn('Key throws error: ', value, store);
                }

                continue;
            }

            // the current key represents a `on` based function handler
            // is this brick a form element?
            let needsVarstoreUpdate: boolean = false;
            if (formElementConfig) {
                // if yes, we need to attach its methods to update varstore
                if (key in formElementConfig.handlers) {
                    // this method needs to be wired differently
                    // to update the varstore.
                    needsVarstoreUpdate = true;
                }
            }

            // yes, and thus it needs to mount to a handler function
            // id for the function supplied?
            let handler: Function;
            if (value && typeof value === 'string') {
                // get our cached handler
                handler = this.getHandler(value);
            }

            // if needed, wire the store updator
            let updator: Function = handler;
            if (needsVarstoreUpdate) {
                let name: string = brickConfig.name || brickConfig.id;
                const form: string = brickConfig.form || '';
                if (form) {
                    name = form + '.' + name;
                }

                if (name) {
                    // create a handler to wire value to varstore
                    updator = (...args) => {
                        // Brickie.debug('brickie: calling set value for name: ' + name);
                        this.props.store.setValue(name, this.getFormElementValue(key, args, formElementConfig));

                        // call any handler attached by client
                        if (handler) {
                            Brickie.debug('brickie: calling original handler');
                            handler(...args);
                        }
                    }
                }
            }

            // wire the handler
            if (updator) {
                props[key] = updator;
                continue;
            }
        }
    }

    /**
     * Evaluate the value of this string expression, checking
     * first if this is an expression or not. If it is not an
     * expression, return the value as is, else evaluate.
     * 
     * @param value 
     */
    evaluateExpression(value: string, store: VarStore): any {
        if (!value || value.trim().length === 0) {
            return value;
        }

        // check if the value is an expression
        // an expression starts with '{' and ends with '}'
        if (!this.isPropAnExpression(value)) {
            Brickie.debug('    value is not an expression, returning value: ', value);
            return value;
        }

        const expression: string = value.substring(1, value.length - 1);
        return store.evaluate(expression);
    }

    /**
     * Extract the value against a form field from the list of the arguments
     * supplied by the handler to the React component. If arguments are `undefined`,
     * or `null`, a value of `null` is returned. If the argument index is not
     * supplied during registering the element, the very first argument (0th index)
     * is picked. If argument field is not defined, the entire argument is set
     * in store.
     * 
     * @param key the key name as specified in brick. this is also the handler name
     * that is being trapped
     * 
     * @param args the incoming arguments
     * 
     * @param formConfig the `FormConfig` instance attached to the form element
     */
    getFormElementValue(key: string, args: any, formConfig: FormConfig): any {
        // no arguments were passed by the handler
        if (!args) {
            return undefined;
        }

        const config: HandlerConfig = formConfig.handlers[key];

        const arg = args[config.argIndex];
        if (!arg) {
            return undefined;
        }

        if (!config.argField) {
            return arg;
        }

        return getExistsWithValue(arg, config.argField).value;
    }

    /**
     * Find the handler for the given string. This tries to
     * find a `function` that can be called when any event
     * inside any React component happens. The handlers are
     * cached to speed up development as well as not to 
     * remove/add listeners during re-rendering.
     * 
     * @param id the `string` identifier to be used as the
     * handler
     */
    private getHandler(id: string): Function {
        const handler = this.props.callbackHandler;
        if (!handler) {
            return null;
        }

        // see if we have a cached handler or not?
        let cached: Function = this.handlerCache.get(id);
        if (cached) {
            // we have a cached one, return it
            return cached;
        }

        // we have nothing in cache
        // see if supplied callbackHandler via `props` 
        // is a function?
        if (typeof handler === 'function') {
            // yes, is a function
            // create an anonymous function to supply ID as the first arg
            // and then spread all incoming ones after it
            cached = (...args) => {
                handler(id, ...args);
            }

            // add this to cache
            this.handlerCache.set(id, cached);

            // return this new handler
            return cached;
        }

        // is supplied callbackHandler an object?
        if (typeof handler === 'object') {
            // yes, find a property inside this object
            // by the given name
            const candidate: any = handler[id];

            // if property exists and is a function?
            if (candidate && typeof candidate === 'function') {
                // yes, use this function as handler
                // also save it in cache
                this.handlerCache.set(id, candidate);
                return candidate;
            }
        }

        // no valid handler found
        return null;
    }

    /**
     * Internal method to add `key` attributes to each brick
     * in the JSON. This allows `React` to perform diffs faster.
     * Any `key` attribute already existing on a brick is left
     * as is.
     * 
     * This method also adds the `form` name to each form element
     * as well so that aggregation can be done correctly, when
     * the form is used.
     * 
     * @param json 
     * 
     * @param formName the name of the form, if any, which is
     * the current running parent.
     */
    private addKeyFields(json: any, formName: string = ''): void {
        if (!json) {
            return;
        }

        // json is not an object - nothing to do
        if (typeof json !== 'object') {
            return;
        }

        // for array - iterate over each element in array
        if (Array.isArray(json)) {
            for (let index: number = 0; index < json.length; index++) {
                const item = json[index];
                this.addKeyFields(item, formName);
            }

            return;
        }

        // add the key field if not already present
        // this will allow faster reconcilation by react
        if (!json.key) {
            json.key = (this.props.keyPrefix || 'brickie-field') + '-' + (++this.idCounter);
            Brickie.debug('key: ', json.key);
        }

        // copy it as a data attribute
        json['data-brickie-key'] = json.key;

        // check other attributes of this brick
        const fields: string[] = this.findPropsThatAreExpressions(json);
        if (fields && fields.length > 0) {
            // the brick has expressions
            json[BRICK_WITH_EXPR_IDENTIFIER] = fields;
        } else {
            delete json[BRICK_WITH_EXPR_IDENTIFIER];
        }

        // if JSON has children - run addition of key field
        // on its children
        if (json.children) {
            let childFormName: string = formName;
            // check if current brick is a form
            if (Bricks.isFormBrick(json.brick)) {
                if (json.name) {
                    // the form has been given a name
                    // we will use this form name on all child elements
                    childFormName = json.name;
                }
            }
            this.addKeyFields(json.children, childFormName);
        }

        // for all form element bricks add the form name
        // so that varstore can be managed in the right order
        if (Bricks.isFormElementBrick(json.brick)) {
            // check if we have a form already present or not
            // if not, add the form name if needed
            if (formName && !json.form) {
                json.form = formName;
            }
        }

        // check for specific child attributes of the brick
        let brickConfig: BrickConfig = Bricks.brickMappings[json.brick];

        if (!brickConfig) {
            brickConfig = SPECIAL_BRICKS[json.brick];
        }

        if (!brickConfig) {
            return;
        }

        // these are the attributes that can act as children
        // instead of the `children` prop - like `if` component
        // takes a `then` and `else` block - which are essentially
        // children for a condition
        if (brickConfig.childAttributes) {
            for (let index = 0; index < brickConfig.childAttributes.length; index++) {
                let attr: string = brickConfig.childAttributes[index];

                if (json[attr]) {
                    this.addKeyFields(json[attr]);
                }
            }
        }
    }

    /**
     * Check if a given prop value is an expression or 
     * not (surrounded by `{}`).
     * 
     * @param value 
     */
    private isPropAnExpression(value: any): boolean {
        if (!value) {
            return false;
        }

        if (typeof value !== 'string') {
            return false;
        }

        const str: string = value.trim();
        if (str.length < 2) {
            return false;
        }
        if (str.startsWith('{') && str.endsWith('}')) {
            return true;
        }

        return false;
    }

    /**
     * Return all keys for a JSON object (brick) that act
     * as expressions - surrounded by `{}` brackets.
     * 
     * @param json 
     */
    private findPropsThatAreExpressions(json: any): string[] {
        if (!json) {
            return null;
        }

        const keys: string[] = Object.keys(json);
        if (!keys) {
            return null;
        }

        const result: string[] = [];

        keys.forEach(key => {
            let value: any = json[key];
            if (this.isPropAnExpression(value)) {
                result.push(key);
            }
        });

        return result;
    }
}
