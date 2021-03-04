import BrickConfig from './BrickConfig';
import FormConfig, { HandlerMap } from "./FormConfig";
import HandlerConfig from "./HandlerConfig";

// special bricks
import ForLoop from "./components/ForLoop";
import IfClause from "./components/IfClause";
import Http from './components/Http';
import Brickie from './Brickie';

// export types
export type BrickMap = { [key: string]: BrickConfig };

export type FormMap = { [key: string]: FormConfig };

export const SPECIAL_BRICKS: BrickMap = {
    'foreach': new BrickConfig(ForLoop, ['template']),
    'if': new BrickConfig(IfClause, ['then', 'else']),
    'http': new BrickConfig(Http, ['load', 'success', 'error'])
}

/**
 * Contains configuration for different kind
 * of bricks we have in the system.
 * 
 */
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
        if (!name) {
            throw new Error('Cannot register form without a name');
        }

        const handlers: HandlerMap = {};

        if (Array.isArray(methods)) {
            methods.forEach(method => {
                handlers[method] = undefined;
            });
        }

        if (typeof methods === 'string') {
            handlers[methods] = undefined;
        }

        name = name.trim();

        // check if we already have config registered
        let config = Bricks.formMappings[name];
        if (!config) {
            config = new FormConfig(name, handlers);
            Bricks.formMappings[name] = config;
        } else {
            // merge handlers
            config.handlers = Object.assign(config.handlers, handlers);
        }
    }

    static registerFormElement(name: string, handlers: HandlerConfig | HandlerConfig[] = []): void {
        if (!name) {
            throw new Error('Cannot register form without a name');
        }

        const handlerMap: HandlerMap = {};
        if (Array.isArray(handlers)) {
            handlers.forEach(handler => {
                handlerMap[handler.method] = handler;
            });
        } else {
            handlerMap[handlers.method] = handlers;
        }

        name = name.trim();

        // check if we already have config registered
        let config = Bricks.formElementMappings[name];
        if (!config) {
            config = new FormConfig(name, handlerMap);
            Bricks.formElementMappings[name] = config;
        } else {
            // existing - merge the handler map
            config.handlers = Object.assign(config.handlers, handlerMap);
        }
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

    static getBrick(name:string) {
        if(!name) {
            return null;
        }

        Brickie.debug('current mappings: ', Bricks.brickMappings);
        return Bricks.brickMappings[name];
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

}
