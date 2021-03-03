import * as React from 'react';
import Axios from 'axios';

export default class Http extends React.Component<any, any> {

    constructor(props, context) {
        super(props, context);

        this.state = {
            loading: true
        };
    }

    componentDidMount = async () => {
        let config = {
            headers: {}
        };

        const propKeys = Object.keys(this.props);
        for (let index = 0; index < propKeys.length; index++) {
            const propKey = propKeys[index];

            if (propKey.startsWith('header-')) {
                const name = propKey.substr(7);
                config.headers[name] = this.props[propKey];
            }
        }

        try {
            const response = await Axios.get(this.props.url, config);
            this.setState({ loading: false, response: response });
        } catch (e) {
            this.setState({ loading: false, error: e });
        }
    }

    render() {
        if(!this.props.renderKids) {
            console.error('did not receive renderKids method');
            return null;
        }
        
        const { loading, response, error } = this.state;
        if (loading) {
            const context = {};
            return this.props.renderKids(this.props.load, context);

            return null;
        }

        if (error) {
            return this.props.renderKids(this.props.error, { error: error });
        }

        return this.props.renderKids(this.props.success, { response: response });
    }

}
