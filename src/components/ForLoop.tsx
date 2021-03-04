import * as React from 'react';
import VarStore from 'varstore';

interface ForLoopProps {
    /**
     * The array of items that need to be iterated on
     */
    items: Array<any>;

    /**
     * The key against which each entry in items stored
     * against
     */
    as: string;

    /**
     * The template you want to render for each give item
     */
    template: [];

    /**
     * This comes from Brickie renderer
     */
    renderKids: (kids: [], store: VarStore, context?: object) => any;

    store: VarStore;
}

export default class ForLoop extends React.Component<ForLoopProps, {}> {

    render() {
        const { items, as, template } = this.props;
        if (!items) {
            return null;
        }

        if (!as) {
            return null;
        }

        if (!template) {
            return null;
        }

        const result = [];
        const length = items.length;
        for (let index = 0; index < length; index++) {
            const item = items[index];
            const context = {};
            context[this.props.as] = item;
            let rendered = this.props.renderKids(template, this.props.store, context);
            if (rendered) {
                result.push(rendered);
            }
        }

        return result;
    }

}
