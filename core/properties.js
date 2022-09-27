import { Subject } from "./rx.js";

export class Property
{
	get value() {
		return this.__value;
	}

	set value(value) {
		this.__value = value;
		this.value$.next(value);
	}

	valueChanges() {
		return this.value$;
	}

	constructor(value, component) {
		this.value$ = new Subject();
		this.setComponent(component);
		this.__value = value;
		this.value$.subscribe(() => this.change());
	}

	setComponent(component) {
		if (component !== null && component !== undefined) {
			this.change = () => component.reload();
		} else {
			this.change = () => {};
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
