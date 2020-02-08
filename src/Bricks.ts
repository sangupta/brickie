export default class Bricks {

    static brickMappings: any = {};

    /**
     * Register a new brick using the given React component.
     * 
     * @param name 
     * @param brick 
     */
    static registerBrick(name: string, brick: Function): void {
        if(!name) {
            throw new Error('Cannot register a brick without a name');
        }

        if(!brick) {
            throw new Error('Cannot register an undefined/null brick. To remove use unregister() method.')
        }

        name = name.trim();
        Bricks.brickMappings[name] = brick;
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

    /**
     * Return the brick for the given name.
     * 
     * @param name 
     */
    static getBrick(name: string): Function {
        if(!name) {
            return null;
        }

        name = name.trim();
        return Bricks.brickMappings[name];
    }
}
