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
        let config: any = {
            url: this.props.url,
            method: this.props.method,
            headers: {}
        };

        const methodLower = this.props.method.toLowerCase();
        if (methodLower === 'put' || methodLower === 'post') {
            // build body
            const body: any = {};

            if (this.props.children) {
                (this.props.children as Array<any>).forEach(element => {
                    if (element.type === 'Key') {
                        const kn = element.props.var;
                        if (kn) {
                            const kv = element.props.value;
                            body[kn] = kv;
                        }
                    }
                });
            }

            config.data = body;
        }

        const propKeys = Object.keys(this.props);
        for (let index = 0; index < propKeys.length; index++) {
            const propKey = propKeys[index];

            if (propKey.startsWith('header-')) {
                const name = propKey.substr(7);
                config.headers[name] = this.props[propKey];
            }
        }

        try {
            const response = await Axios.request(config);
            const data = await response.data;
            this.setState({ loading: false, response: response, data: data });
        } catch (e) {
            console.warn('error making xhr call: ', e);
            this.setState({ loading: false, error: e });
        }
    }

    render() {
        const { loading, response, error, data } = this.state;
        if (loading) {
            return this.props.renderKids(this.props.load, this.props.store);
        }

        if (error) {
            return this.props.renderKids(this.props.error, this.props.store, { error: error });
        }

        const context = {};
        if (this.props.as) {
            const object = { status: response.status, statusText: response.statusText, config: response.config, data: response.data };
            context[this.props.as] = object;
        }
        if (this.props.dataAs) {
            context[this.props.dataAs] = data;
        }

        return this.props.renderKids(this.props.success, this.props.store, context);
    }

}
