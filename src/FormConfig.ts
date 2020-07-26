/**
 * Stores details on a form and form elements: the
 * name of the brick, the methods to wire, and other
 * optional argument details.
 * 
 * @author sangupta
 */
export default class FormConfig {

    name: string;

    methods: string[];

    argIndex: number;

    argField: string;

    constructor(name: string, methods: string[] = []) {
        this.name = name;
        this.methods = methods;
    }
    
}
