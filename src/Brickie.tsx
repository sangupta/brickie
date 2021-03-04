import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BrickLayer from './BrickLayer';
import Bricks from './Bricks';
import BrickConfig from './BrickConfig';
import VarStore from 'varstore';
import HandlerConfig from './HandlerConfig';

interface LayoutOptions {

    bricks: any;

    keyPrefix?: string;
}

/**
 * The central class for Brickie framework.
 * External applications should only interact
 * with this class.
 */
export default class Brickie {

    private static DEBUG_MODE: boolean = false;

    /**
     * The react element that is currently rendered
     */
    private reactElement: any;

    /**
     * The HTML element on which the current UI is mounted
     */
    private domElement: HTMLElement;

    /**
     * Layout a given UI json. This convenience method creates a
     * new instance of `Brickie` and lays out the UI, and then
     * return the generated instance.
     * 
     * @param options Layout options which also include the JSON 
     * object to render
     * 
     * @param mountElement the `HTMLElement` to which the layout
     * shall be rendered
     * 
     * @param store the `varstore` object that needs to be used
     * for rendering. To update the state in an already rendered
     * layout, please use methods on the `varstore` instance 
     * directly.
     * 
     * @param callbackHandler the callback handler to be used when
     * actions are invoked on components
     */
    static lay(options: LayoutOptions, mountElement: HTMLElement, store: VarStore, callbackHandler?: Function | object): Brickie {
        const brickie: Brickie = new Brickie();
        brickie.lay(options, mountElement, store, callbackHandler);
        return brickie;
    }

    /**
     * Lay out the UI using `BrickLayer`.
     * 
     * @param options 
     * @param mountElement 
     */
    lay(options: LayoutOptions, mountElement: HTMLElement, store?: VarStore, callbackHandler?: Function | object): void {
        if (!options) {
            throw new Error('Layout options are a must to render.');
        }

        if (!options.bricks) {
            throw new Error('Bricks are a must to render.');
        }

        if (!mountElement) {
            throw new Error('HTMLElement to mount the layout to is a must.');
        }

        this.domElement = mountElement;

        const brickLayer = <BrickLayer
            layout={options.bricks}
            callbackHandler={callbackHandler}
            keyPrefix={options.keyPrefix}
            store={store} />;

        this.reactElement = ReactDOM.render(brickLayer, mountElement);
    }

    /**
     * Clear currently mounted components.
     * 
     */
    clear(): void {
        if (!this.domElement) {
            return;
        }

        ReactDOM.unmountComponentAtNode(this.domElement);

        // clear up references
        this.domElement = null;
        if (this.reactElement) {
            this.reactElement = null;
        }
    }

    /**
     * Register bricks in the global context. A brick thus registered
     * will be available for render immediately to all `Brickie`
     * instances.
     * 
     * @param name 
     * @param component 
     */
    static registerBrick(name: string, component: Function, childAttributes?: string[]): void {
        if (!component) {
            throw new Error('Cannot register a brick without a component function with name: ' + name);
        }

        Bricks.registerBrick(name, new BrickConfig(component, childAttributes));
    }

    /**
     * 
     * @param name 
     * @param brickConfig 
     */
    static registerBrickConfig(name: string, brickConfig: BrickConfig): void {
        Bricks.registerBrick(name, brickConfig);
    }

    /**
     * Register a lot of bricks from a `* as` import.
     * 
     * @param obj 
     */
    static registerBricks(obj: object): void {
        if (!obj) {
            return;
        }

        const keys = Object.keys(obj);
        for (let index = 0; index < keys.length; index++) {
            let key = keys[index];
            Brickie.registerBrick(key, obj[key]);
        }
    }

    /**
     * Unregister a previously registered brick by this name.
     * 
     * @param name 
     */
    static unregisterBrick(name: string): void {
        Bricks.unregisterBrick(name);
    }

    /**
     * Unregister all registered bricks. After this call succeeds
     * none of the `Brickie` instances will be able to render
     * the UI.
     * 
     */
    static unregisterAllBricks(): void {
        Bricks.unregisterAllBricks();
    }

    /**
     * Register the brick with given name to act like a HTML form
     * tag.
     * 
     * @param name the name of the brick as registered in Brickie
     * 
     * @param methods (optional) the name of methods to capture for invoking
     * method onSubmit with the form data
     */
    static registerForm(name: string, methods?: string | string[]): void {
        Bricks.registerForm(name, methods);
    }

    /**
     * Register the brick with given name to act like a HTML form
     * element tag like `input` or `select`.
     * 
     * @param name the name of the brick as registered in Brickie
     * 
     * @param methods (optional) the name of method/methods to capture for invoking
     * method onSubmit with the form data
     * 
     * @param argIndex (optional) the argument index in the event being
     * shot by the react component
     * 
     * @param argField (optional) the field to read from the argument
     * when the value is to be read from a child field
     */
    static registerFormElement(name: string, methods?: string | string[], argIndex?: number, argField?: string): void {
        if (!methods) {
            Bricks.registerFormElement(name, []);
            return;
        }

        if (Array.isArray(methods)) {
            methods.forEach(method => {
                const handler = new HandlerConfig(method, argIndex || 0, argField || '');
                Bricks.registerFormElement(name, handler);
            });
            return;
        }

        const handler = new HandlerConfig(methods, argIndex || 0, argField || '');
        Bricks.registerFormElement(name, handler);
    }

    /**
     * Register the brick with given name to act like a HTML form
     * element tag like `input` or `select`.
     * 
     * @param name the name of the brick as registered in Brickie
     * 
     * @param handlers (optional) the handlers to attach to this form element
     */
    static registerFormElementWithHandler(name: string, handlers: HandlerConfig | HandlerConfig[] = []): void {
        Bricks.registerFormElement(name, handlers);
    }

    static debug(...args) {
        if(Brickie.DEBUG_MODE) {
            console.log.apply(null, args);
        }
    }

    static info(...args) {
        if(Brickie.DEBUG_MODE) {
            console.info.apply(null, args);
        }
    }

    static warn(...args) {
        console.warn.apply(null, args);
    }

    static error(...args) {
        console.error.apply(null, args);
    }

    static setDebug(enabled: boolean) {
        Brickie.DEBUG_MODE = enabled;
    }
}
