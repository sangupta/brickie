import ForLoop from "./components/ForLoop";
import IfClause from "./components/IfClause";
import BrickConfig from './BrickConfig';

export type BrickMap = { [key: string]: BrickConfig };

export const SPECIAL_BRICKS: BrickMap = {
    'foreach': new BrickConfig(ForLoop, ['template']),
    'if': new BrickConfig(IfClause, ['then', 'else'])
}

export default class Bricks {

    static brickMappings: BrickMap = {};

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

    /**
     * Unregister a previously registered brick by this name.
     * 
     * @param name 
     */
    static unregister(name: string): void {
        delete Bricks.brickMappings[name];
    }

    static unregisterAll(): void {
        Bricks.brickMappings = {};
    }

}
