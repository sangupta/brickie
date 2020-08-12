import * as React from 'react';
import VarStore from 'varstore';

export type AstEntry = { [key: string]: any };

interface ProxyBrickProps {
    /**
     * The actual brick to render
     */
    element: any;

    /**
     * Non computed props that need to be assigned
     * to the actual element to be rendered.
     */
    staticProps: object;

    /**
     * Expression props that need to be evaluated
     * and assigned to the element.
     */
    dynamicProps: object;

    /**
     * The children that need to be added to this
     * brick
     */
    childBricks: any;

    /**
     * The `varstore` to use for all dynamic
     * computations.
     */
    store: VarStore;

    /**
     * This comes from Brickie renderer
     */
    renderKids: (kids: [], context?: object) => any;
}

export default class ProxyBrick extends React.Component<ProxyBrickProps, {}> {

    /**
     * All dynamic identifiers that this component depends
     * upon. Will be computed at component construction time
     */
    depends: Set<string> = new Set();

    /**
     * Store parsed AST nodes against each dynamic prop
     */
    ast: AstEntry = {};

    /**
     * Constructor to this component
     * 
     * @param props 
     * @param config 
     */
    constructor(props: ProxyBrickProps, config) {
        super(props, config);

        // find all dynamic property names
        if (!this.props.dynamicProps) {
            console.error('No dynamic props supplied to proxy');
            return;
        }

        const dynamicKeys: string[] = Object.keys(this.props.dynamicProps);
        if (!dynamicKeys) {
            console.error('No dynamic keys bound to this component');
            return;
        }

        // we need to create and cache the AST for each expression
        // this allows to save time between re-renders
        dynamicKeys.forEach(dynamicKey => {
            // get the string based expression
            const dynamicProp: string = this.props.dynamicProps[dynamicKey];

            // convert it to the AST expression
            const nodeAndIdentifiers: any = this.props.store.parseExpression(dynamicProp);
            const node: any = nodeAndIdentifiers.node;
            const identifiers: string[] = nodeAndIdentifiers.identifiers;

            // find all identifiers that all these ASTs depend upon
            if (identifiers && identifiers.length > 0) {
                identifiers.forEach(id => {
                    this.depends.add(id);
                });
            }

            // cache this value
            this.ast[dynamicKey] = node;
        });

        // next subscribe to each identifier in the varstore
        // this will allow that 
        this.depends.forEach(key => {
            this.props.store.subscribe(key, this.storeWatchHandler);
        })
    }

    /**
     * We need to unsubscribe from `varstore` all the properties
     * that we were observing/watching
     */
    componentWillUnmount(): void {
        this.depends.forEach(key => {
            this.props.store.unsubscribe(key, this.storeWatchHandler);
        });
    }

    storeWatchHandler = (prop: string, value: any): void => {
        if (!prop) {
            return;
        }

        // just re-render
        this.forceUpdate();
    }

    render() {
        // find out all props that need to be assigned to this element
        // first, re-compute the dynamic properties for this brick
        const evaluated = {};
        const keys: string[] = Object.keys(this.ast);
        keys.forEach(key => {
            if ('children' === key) {
                return;
            }

            evaluated[key] = this.props.store.evaluateNode(this.ast[key]);
        });

        // second, merge static and dynamic properties
        const props = { ...this.props.staticProps, ...evaluated };

        // check if children is part of evaluated properties or not
        let children;
        if (this.ast.children) {
            children = this.props.store.evaluateNode(this.ast.children);
        } else {
            children = this.props.renderKids(this.props.childBricks);
        }

        // create the element
        return React.createElement(this.props.element, props, children);
    }

}
