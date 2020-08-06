import HandlerConfig from './HandlerConfig';

export type HandlerMap = { [key: string]: HandlerConfig };

/**
 * Stores details on a form and form elements: the
 * name of the brick, the methods to wire, and other
 * optional argument details.
 * 
 * @author sangupta
 */
export default class FormConfig {

    name: string;

    handlers: HandlerMap;

    constructor(name: string, handlers: HandlerMap = {}) {
        this.name = name;
        this.handlers = handlers;
    }

}
