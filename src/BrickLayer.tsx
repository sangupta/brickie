import * as React from 'react';
import Bricks from './Bricks';
import BrickUtils from './BrickUtils';

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
     * Handler cache to speed up re-rendering cycles
     */
    private handlerCache: Map<string, Function> = new Map();

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
    renderLayout(layout: any): any {
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

    getBrick(brickName: string) {
        if (!brickName) {
            return null;
        }

        return Bricks.brickMappings[brickName];
    }

    /**
     * Render a single brick.
     * 
     * @param brickConfig the brick definition to render
     */
    renderBrick(brickConfig: any): any {
        let brickType = this.getBrick(brickConfig.brick);

        if (!brickType) {
            console.log('no brick found for given name: ', brickConfig.brick);
            return null;
        }

        // create an object instance of the component that we have
        const props: any = {};

        // copy brick properties.
        this.copyBrickProperties(props, brickConfig);

        // add ID prop
        props.key = brickConfig.key;

        // remove children - as they are passed via React.createElement
        delete props['children']; // delete children object

        // check if we have children
        const childBricks = brickConfig.children;
        let children = null;

        if (childBricks) {
            if (BrickUtils.isPrimitive(childBricks)) {
                children = childBricks;
            } else {
                children = this.renderLayout(brickConfig.children);
            }
        }

        // create the element
        let element = React.createElement(brickType, props, children);

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
        // 
        const keys = Object.keys(brickConfig);
        if (!keys || keys.length === 0) {
            return;
        }

        for (let index = 0; index < keys.length; index++) {
            const key: string = keys[index];
            const value = brickConfig[key];

            if (!key.startsWith('on')) {
                // copy this simple prop
                props[key] = value;
                continue;
            }

            // this needs to mount to our own handler
            if (typeof value === 'string') {
                const handler = this.getHandler(value);
                if (handler) {
                    props[key] = handler;
                }
            }

            if (typeof value === 'function') {
                props[key] = value;
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

        let cached: Function = this.handlerCache.get(id);
        if (cached) {
            return cached;
        }

        if (typeof handler === 'function') {
            cached = (...args) => {
                handler(id, ...args);
            }

            this.handlerCache.set(id, cached);
            return cached;
        }

        if (typeof handler === 'object') {
            const candidate: any = handler[id];
            if (typeof candidate === 'function') {
                this.handlerCache.set(id, candidate);
                return candidate;
            }
        }

        return null;
    }
}
