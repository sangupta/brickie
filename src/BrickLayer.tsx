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

    getBrick(brickName:string) {
        if(!brickName) {
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

    private handleAnyEvent(id, ...args): void {
        console.log('Handling event: ', arguments);
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
            let key: string = keys[index];

            if (!key.startsWith('on')) {
                // copy this simple prop
                props[key] = brickConfig[key];
                continue;
            }

            // this needs to mount to our own handler
            props[key] = (...args) => {
                this.handleAnyEvent(key, ...args);
            }
        }
    }
}
