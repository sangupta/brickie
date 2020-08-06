/**
 * Holds details about one handler attached to any
 * React component. The handler has a method name to 
 * trap, the index of argument in list, and the field
 * to read from that argument to evaluate final value.
 */
export default class HandlerConfig {

    method: string;

    argIndex: number = 0;

    argField: string;

    constructor(method: string, argIndex: number = 0, argField: string = '') {
        this.method = method;
        this.argIndex = argIndex;
        this.argField = argField;
    }

}
