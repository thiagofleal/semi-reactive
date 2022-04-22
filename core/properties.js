import { Observable } from "./rx.js";

export class Property
{
	get value() {
		return this.__value;
	}

	set value(value) {
		this.__value = value;
		this.__observers.forEach(element => element.next(value));
		this.change(value);
	}

	valueChanges() {
		return new Observable(observer => {
			this.__observers.push(observer);
			return () => {
				const index = this.__observers.indexOf(observer);
				if (index >= 0) {
					this.__observers.splice(index, 1);
				}
			};
		});
		
	}

	constructor(value, component) {
		this.__observers = [];
		this.change = () => {};
		this.setComponent(component);
		this.__value = value;
	}

	setComponent(component) {
		if (component !== null && component !== undefined) {
			this.change = () => component.reload();
		}
	}

	associate(property) {
		if (property && property instanceof Property) {
			property.value = this.value;
			const change = this.change;
			this.change = () => {
				change();
				property.value = this.value;
			};
		}
	}
}

export class PropertySet
{
    constructor() {
        this.properties = {};
    }

    set(key, property) {
        this.properties[key] = property;
    }

    get(key) {
        return this.properties[key];
    }

    keys() {
        return Object.keys(this.properties);
    }

    getAll() {
        const ret = [];

        for (let key of this.keys()) {
            ret.push({ key, property: this.get(key) });
        }
        return ret;
    }
}
