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

    private static reactElement: any;

    private static domElement: HTMLElement;

    static layout(json: object, mountElement: HTMLElement): void {
        if(!json) {
            throw new Error('JSON layout to render is a must.');
        }

        if(!mountElement) {
            throw new Error('HTMLElement to mount the layout to is a must.');
        }
        
        Brickie.domElement = mountElement;
        Brickie.reactElement = ReactDOM.render(<BrickLayer layout={json} />, mountElement);
    }

    static clear(): void {
        if (!Brickie.domElement) {
            return;
        }

        ReactDOM.unmountComponentAtNode(Brickie.domElement);

        // clear up references
        Brickie.domElement = null;
        if (Brickie.reactElement) {
            Brickie.reactElement = null;
        }
    }

    static registerBrick(name: string, component: Function): void {
        Bricks.registerBrick(name, component);
    }

    /**
     * Unregister a previously registered brick by this name.
     * 
     * @param name 
     */
    static unregister(name: string): void {
        Bricks.unregister(name);
    }

    static unregisterAll(): void {
        Bricks.unregisterAll();
    }
}
