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
        const { loading, response, error } = this.state;
        if (loading) {
            return this.props.renderKids(this.props.load, this.props.store);
        }

        if (error) {
            return this.props.renderKids(this.props.error, this.props.store, { error: error });
        }

        const object = { status: response.status, statusText: response.statusText, config: response.config, data: response.data };
        const context = {};
        context[this.props.as] = object;
        return this.props.renderKids(this.props.success, this.props.store, context);
    }

}
