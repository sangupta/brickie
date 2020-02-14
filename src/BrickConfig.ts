/**
 * Stores details on a given brick. The
 * constructor function, the attributes that
 * can be its children, apart from `children`
 * attribute in the JSON.
 * 
 */
export default class BrickConfig {

    brickCtor: Function;

    childAttributes: string[];

    constructor(ctor: Function, childAttributes: string[]) {
        this.brickCtor = ctor;
        this.childAttributes = childAttributes;
    }
}
