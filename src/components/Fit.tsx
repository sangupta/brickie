import * as React from 'react';

export default class Fit extends React.Component<any> {

    render() {
        const { slotKey } = this.props;
        if (typeof slotKey === 'undefined' || slotKey == null) {
            return null;
        }

        const kids = this.props[slotKey];
        if (!kids) {
            return null;
        }

        return this.props.renderKids(kids, this.props.store);
    }

}
