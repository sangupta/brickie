import ForLoop from "./components/ForLoop";
import IfClause from "./components/IfClause";
import BrickConfig from './BrickConfig';
import FormConfig from "./FormConfig";

export type BrickMap = { [key: string]: BrickConfig };

export type FormMap = { [key: string]: FormConfig };

export const SPECIAL_BRICKS: BrickMap = {
    'foreach': new BrickConfig(ForLoop, ['template']),
    'if': new BrickConfig(IfClause, ['then', 'else'])
}

export default class Bricks {

    static brickMappings: BrickMap = {};

    static formMappings: FormMap = {};

    static formElementMappings: FormMap = {};

    /**
     * Register a new brick using the given React component.
     * 
     * @param name 
     * @param brick 
     */
    static registerBrick(name: string, brickConfig: BrickConfig): void {
        if (!name) {
            throw new Error('Cannot register a brick without a name');
        }

        if (!brickConfig) {
            throw new Error('Cannot register an undefined/null brick. To remove use unregister() method.')
        }

        name = name.trim();
        Bricks.brickMappings[name] = brickConfig;
    }

    static registerForm(name: string, methods?: string | string[]): void {
        Bricks.formMappings[name] = Bricks.getFormConfig(name, methods);
    }

    static registerFormElement(name: string, methods?: string | string[], argIndex?: number, argField?: string): void {
        const config = Bricks.getFormConfig(name, methods);
        if (argIndex) {
            config.argIndex = argIndex;
        }
        if (argField) {
            config.argField = argField;
        }

        Bricks.formElementMappings[name] = config;
    }

    /**
     * Unregister a previously registered brick by this name.
     * 
     * @param name the name of the brick that needs to be removed
     */
    static unregisterBrick(name: string): void {
        delete Bricks.brickMappings[name];
    }

    /**
     * Unregister all bricks immediately. This does not unregister
     * Brickie's own special bricks.
     */
    static unregisterAllBricks(): void {
        Bricks.brickMappings = {};
    }

    /**
     * Check if the brick with the given name has been registered
     * as a `form` brick.
     * 
     * @param name the name of the brick
     * 
     * @throws if the brick name is `undefined`, `null` or `empty`
     */
    static isFormBrick(name: string): boolean {
        if (!name) {
            throw new Error('Brick name is required');
        }

        let config = Bricks.formMappings[name];
        if (config) {
            return true;
        }

        return false;
    }

    /**
     * Check if the brick with the given name has been registered
     * as a `form element` brick.
     * 
     * @param name the name of the brick
     * 
     * @throws if the brick name is `undefined`, `null` or `empty`
     */
    static isFormElementBrick(name: string): boolean {
        if (!name) {
            throw new Error('Brick name is required');
        }

        let config = Bricks.formElementMappings[name];
        if (config) {
            return true;
        }

        return false;
    }

    private static getFormConfig(name: string, methods?: string | string[]): FormConfig {
        if (!name) {
            throw new Error('Cannot register form/element without a name');
        }

        let array;
        if (Array.isArray(methods)) {
            array = methods;
        }
        if (typeof methods === 'string') {
            array = [];
            array.push(methods);
        }

        name = name.trim();
        return new FormConfig(name, array);
    }

}
