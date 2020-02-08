export default class BrickUtils {

    static isPrimitive(value: any): boolean {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return true;
        }

        return false;
    }

}
