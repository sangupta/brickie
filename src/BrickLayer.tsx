import * as React from 'react';
import Bricks from './Bricks';
import { SPECIAL_BRICKS } from './Bricks';

import BrickUtils from './BrickUtils';
import BrickConfig from 'BrickConfig';

import VarStore from 'varstore';

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
        if(props.layout) {
            console.log('requesting addition of key fields');
        
            this.addKeyField(props.layout);
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

        return this.renderLayout(layout);
    }

    /**
     * Render the layout using JSON structure created by `Brickie`.
     * 
     * @param layout 
     */
    renderLayout = (layout: any): any => {
        if (Array.isArray(layout)) {
            let result = [];
            for (let index = 0; index < layout.length; index++) {
                let rendered = this.renderBrick(layout[index]);
                if (rendered) {
                    result.push(rendered);
                }
            }

            return result;
        }

        return this.renderBrick(layout);
    }

    /**
     * Get brick component corresponding to the given name of the
     * brick.
     * 
     * @param brickName the brick name to find the component for
     * 
     * @returns a React component for the given brick name, or `null`
     * if no matching component is found
     */
    getBrick(brickName: string): BrickConfig {
        if (!brickName) {
            return null;
        }

        return Bricks.brickMappings[brickName];
    }

    /**
     * Render the internal `Brickie` components for components
     * like `for` or `if`. These methods get access to this
     * `Brickie` internal method to manipulate the UI.
     *  
     * @param brickConfig 
     */
    private renderKids = (kids: [], context: object = null): any => {
        console.log('render kids');
        if(context) {
            this.props.store.pushContext(context);
        }

        const result = this.renderLayout(kids);
        if(context) {
            this.props.store.popContext();
        }

        return result;
    }

    /**
     * Render a single brick.
     * 
     * @param brickJSON the brick definition to render
     */
    renderBrick = (brickJSON: any): any => {
        const brickName: string = brickJSON.brick;
        if (!brickName) {
            console.log('Brick name has not been specified');
            return null;
        }

        // check for special cases of bricks
        const lowerBrickName: string = brickName.toLowerCase();
        let brickConfig: BrickConfig = SPECIAL_BRICKS[lowerBrickName];
        let specialBrick: boolean = false;
        if (brickConfig) {
            specialBrick = true;
        } else {
            // this is a generic brick - handle it normally
            brickConfig = this.getBrick(brickName);
        }

        if (!brickConfig) {
            console.log('No brick found for given name: ', brickJSON.brick);
            return null;
        }

        // create an object instance of the component that we have
        const props: any = {};

        // copy brick properties.
        this.copyBrickProperties(props, brickJSON);
        props.key = brickJSON.key; // add ID prop

        if (specialBrick) {
            props.renderKids = this.renderKids;
        }

        // remove children - as they are passed via React.createElement
        delete props['children']; // delete children object

        // check if we have children
        const childBricks = brickJSON.children;
        let children = null;

        if (childBricks) {
            if (BrickUtils.isPrimitive(childBricks)) {
                children = childBricks;
            } else {
                children = this.renderLayout(brickJSON.children);
            }
        }

        // create the element
        let element = React.createElement(brickConfig.brickCtor as any, props, children);

        // return it
        return element;
    }

    /**
     * we cannot just blindly copy all props
     * like Object.assign(props, brickConfig);
     * any handler directly for that shall not
     * work. thus for any prop that starts with
     * `on` we will convert that to a handler of
     * ours that we shall use to pass.
     * 
     * @param props 
     * @param brickConfig 
     */
    private copyBrickProperties(props: any, brickConfig: any): void {
        // find all keys inside configuration
        const keys = Object.keys(brickConfig);
        if (!keys || keys.length === 0) {
            // no prop is supplied, nothing to set
            return;
        }

        // iterate over all props in config
        for (let index = 0; index < keys.length; index++) {
            // read both prop and its value
            const key: string = keys[index];
            const value = brickConfig[key];

            if (key === 'brick') {
                continue;
            }

            // is the value a function back in the JSON itself
            // mount it directly, nothing to massage here
            if (typeof value === 'function') {
                props[key] = value;
                continue;
            }

            // does prop start with `on` - it must be a handler
            if (!key.startsWith('on')) {
                // no! so simply copy this simple prop
                if (!key.startsWith('$')) {
                    props[key] = value;
                    continue;
                }

                // this is an expression, that needs to be
                // evaluated
                console.log('evaluate: ' + value);
                let evaluated = this.props.store.evaluate(value);
                props[key.substring(1)] = evaluated;
                continue;
            }

            // yes, and thus it needs to mount to a handler function
            // id for the function supplied?
            if (value && typeof value === 'string') {
                // get our cached handler
                const handler = this.getHandler(value);
                if (handler) {
                    props[key] = handler;
                    continue;
                }
            }
        }
    }

    /**
     * Find the handler for the given string. This tries to
     * find a `function` that can be called when any event
     * inside any React component happens. The handlers are
     * cached to speed up development as well as not to 
     * remove/add listeners during re-rendering.
     * 
     * @param id 
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
     * @param json 
     */
    private addKeyField(json: any):void {
        if (!json) {
            return;
        }

        if (typeof json !== 'object') {
            return;
        }

        if (Array.isArray(json)) {
            for (let index: number = 0; index < json.length; index++) {
                const item = json[index];
                this.addKeyField(item);
            }

            return;
        }

        if (!json.key) {
            json.key = 'brickie-field-' + (++this.idCounter);
        }

        if (json.children) {
            this.addKeyField(json.children);
        }

        // check for specific child attributes of the brick
        let brickConfig: BrickConfig = Bricks.brickMappings[json.brick];

        if (!brickConfig) {
            brickConfig = SPECIAL_BRICKS[json.brick];
        }

        if (!brickConfig) {
            return;
        }

        if (brickConfig.childAttributes) {
            for (let index = 0; index < brickConfig.childAttributes.length; index++) {
                let attr: string = brickConfig.childAttributes[index];

                if (json[attr]) {
                    this.addKeyField(json[attr]);
                }
            }
        }
    }

}
