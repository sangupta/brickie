import * as React from 'react';
import VarStore from 'varstore';

interface IfClauseProps {
    condition: boolean | string | object;
    then: any;
    else: any;
    renderKids: (kids: [], store: VarStore, context?: object) => any;
    store: VarStore;
}

export default class IfClause extends React.Component<IfClauseProps, {}> {

    render() {
        if (this.props.condition) {
            return this.props.renderKids(this.props.then, this.props.store);
        }

        return this.props.renderKids(this.props.else, this.props.store);
    }

}
