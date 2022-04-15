import { Observable } from "./rx.js"

export class Injectable
{
    static services = [];
    
    static register(classRef, ...args) {
        const ref = Injectable.services.find(i => i.classRef === classRef);
        const value = new classRef(...args);
        value.onRegister();
        
        if (ref) {
            ref.value = value;
            value.notify("inject-set");
        } else {
            Injectable.services.push({ classRef, value });
            value.notify("inject-create");
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
        this.clients = [];
    }

    onRegister() {}

    onGet() {}

    notify(event) {
        this.clients.forEach(client => client.next(event));
    }

    notifications() {
        return new Observable(observer => {
            this.clients.push(observer);

            return () => {
                const index = this.clients.indexOf(observer);

                if (index !== -1) {
                    this.clients.splice(index, 1);
                }
            };
        });
    }
}