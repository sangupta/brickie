import * as React from 'react';
import * as ReactDOM from 'react-dom';
import BrickLayer from './BrickLayer';
import Bricks from './Bricks';

/**
 * The central class for Brickie framework.
 * External applications should only interact
 * with this class.
 */
export default class Brickie {

    /**
     * An identifier counter to generate unique keys
     */
    private static idCounter: number = 0;

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
    static lay(json: object, mountElement: HTMLElement, state?: object, callbackHandler?: Function | object): Brickie {
        const brickie: Brickie = new Brickie();
        brickie.lay(json, mountElement, state, callbackHandler);
        return brickie;
    }

    /**
     * Lay out the UI using `BrickLayer`.
     * 
     * @param json 
     * @param mountElement 
     */
    lay(json: object, mountElement: HTMLElement, state?: object, callbackHandler?: Function | object): void {
        if (!json) {
            throw new Error('JSON layout to render is a must.');
        }

        if (!mountElement) {
            throw new Error('HTMLElement to mount the layout to is a must.');
        }

        // add _id to each element to help re-rendering faster
        Brickie.idCounter = 0;
        Brickie.addKeyField(json);

        this.domElement = mountElement;

        const brickLayer = <BrickLayer 
                                layout={json}
                                callbackHandler={callbackHandler} 
                                state={state} />;
        
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
    static registerBrick(name: string, component: Function): void {
        Bricks.registerBrick(name, component);
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
    static unregister(name: string): void {
        Bricks.unregister(name);
    }

    /**
     * Unregister all registered bricks. After this call succeeds
     * none of the `Brickie` instances will be able to render
     * the UI.
     * 
     */
    static unregisterAll(): void {
        Bricks.unregisterAll();
    }

    /**
     * Internal method to add `key` attributes to each brick
     * in the JSON. This allows `React` to perform diffs faster.
     * Any `key` attribute already existing on a brick is left
     * as is.
     * 
     * @param json 
     */
    private static addKeyField(json: any) {
        if (!json) {
            return;
        }

        if (typeof json !== 'object') {
            return;
        }

        if (Array.isArray(json)) {
            for (let index: number = 0; index < json.length; index++) {
                const item = json[index];
                Brickie.addKeyField(item);
            }

            return;
        }

        if (!json.key) {
            json.key = 'brickie-field-' + (++Brickie.idCounter);
        }

        if (json.children) {
            Brickie.addKeyField(json.children);
        }
    }

}
