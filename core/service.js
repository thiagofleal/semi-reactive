export class Injectable
{
    static services = [];
    
    static register(classRef, ...args) {
        const ref = Injectable.services.find(i => i.classRef === classRef);
        const value = new classRef(...args);

        if (ref) {
            ref.value = value;
        } else {
            Injectable.services.push({ classRef, value });
        }
    }

    static get(classRef) {
        const item = Injectable.services.find(i => i.classRef === classRef);
        
        if (item) {
            return item.value;
        }
        return null;
    }
}