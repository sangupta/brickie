import * as React from 'react';

interface IfClauseProps {
    condition: boolean | string | object;
    then: any;
    elseif: any;
    renderKids: (kids: [], context?: object) => any;
}

export default class IfClause extends React.Component<IfClauseProps, {}> {

    render() {
        if (this.props.condition) {
            return this.props.renderKids(this.props.then);
        }

        return this.props.renderKids(this.props.elseif);
    }

}
