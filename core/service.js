import { Subject } from "./rx.js"

export class Injectable
{
    static services = [];
    
    static register(classRef, ...args) {
        const ref = Injectable.services.find(i => i.classRef === classRef);
        
        if (!ref) {
            const value = new classRef(...args);
            value.onRegister();
            Injectable.services.push({ classRef, value });
            value.notify({
                name: "inject-create",
                group: "injection",
                from: Injectable
            });
        }
    }

    static get(classRef) {
        const item = Injectable.services.find(i => i.classRef === classRef);
        
        if (item) {
            item.value.onGet();
            return item.value;
        }
        return null;
    }
}

export class Service
{
    constructor() {
        this.events$ = new Subject();
    }

    onRegister() {}

    onGet() {}

    notify(event) {
        this.events$.next(event);
    }

    events() {
        return this.events$;
    }
}