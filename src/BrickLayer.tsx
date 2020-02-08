import * as React from 'react';
import Bricks from './Bricks';

interface BrickLayerProps {
    /**
     * The JSON layout that is rendered
     */
    layout: object;
}

export default class BrickLayer extends React.Component<BrickLayerProps, {}> {

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

    /**
     * Render a single brick.
     * 
     * @param brickConfig the brick definition to render
     */
    renderBrick(brickConfig: any): any {
        let brickType = Bricks.brickMappings[brickConfig.brick];

        // TODO: for some reason the method just does not work
        // let brickType = Bricks.getBrick[brickConfig.brick];
        if (!brickType) {
            console.log('no brick found for given name: ', brickConfig.brick);
            return null;
        }

        // create an object instance of the component that we have
        const props: any = {};

        // copy brick properties
        Object.assign(props, brickConfig);
        
        // add ID prop
        props.key = brickConfig.key;

        // remove children - as they are passed via React.createElement
        delete props['children']; // delete children object

        // check if we have children
        let children = null;
        if (brickConfig.children) {
            children = this.renderLayout(brickConfig.children);
        }

        // create the element
        let element = React.createElement(brickType, props, children);

        // return it
        return element;
    }
}
