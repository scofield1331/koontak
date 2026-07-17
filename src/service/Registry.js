export class Registry {
    static instances = {};
    constructor() {
        this.classes = {};
    }

    register(name, instance) {
        Registry.instances[name] = instance;
    }
    isset(name) {
        return Registry.instances[name] !== undefined;
    }

    get(name) {
        if (!Registry.instances[name]) {
            throw new Error(`Class "${name}" not found in registry`);
        }
        return Registry.instances[name];
    }

}
export const registry = new Registry();
