import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BrickLayer from './BrickLayer';
import Bricks from './Bricks';
import BrickConfig from './BrickConfig';
import VarStore from 'varstore';

/**
 * The central class for Brickie framework.
 * External applications should only interact
 * with this class.
 */
export default class Brickie {

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
     * @param json 
     * @param mountElement the `HTMLElement` to which the layout
     * shall be rendered
     * 
     * @param state the initial state of the layout that needs to
     * be rendered. To update the state in an already rendered
     * layout, please use methods on the `Brickie` instance thus
     * returned.
     */
    static lay(json: object, mountElement: HTMLElement, store: VarStore, callbackHandler?: Function | object): Brickie {
        const brickie: Brickie = new Brickie();
        brickie.lay(json, mountElement, store, callbackHandler);
        return brickie;
    }

    /**
     * Lay out the UI using `BrickLayer`.
     * 
     * @param json 
     * @param mountElement 
     */
    lay(json: object, mountElement: HTMLElement, store?: VarStore, callbackHandler?: Function | object): void {
        if (!json) {
            throw new Error('JSON layout to render is a must.');
        }

        if (!mountElement) {
            throw new Error('HTMLElement to mount the layout to is a must.');
        }

        this.domElement = mountElement;

        const brickLayer = <BrickLayer
            layout={json}
            callbackHandler={callbackHandler}
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
     * @param methods (optional) the name of methods to capture for invoking
     * method onSubmit with the form data
     * 
     * @param argIndex (optional) the argument index in the event being
     * shot by the react component
     * 
     * @param argField (optional) the field to read from the argument
     * when the value is to be read from a child field
     */
    static registerFormElement(name: string, methods?: string | string[], argIndex?: number, argField?: string): void {
        Bricks.registerFormElement(name, methods, argIndex, argField);
    }

}
