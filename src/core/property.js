import { Subject } from "../../rx.js";

export class Property {
	#value = undefined;

	get value() {
		return this.#value;
	}

	set value(value) {
		this.#value = value;
		this.value$.next(value);
	}

	valueChanges() {
		return this.value$;
	}

	constructor(value, component) {
		this.value$ = new Subject();
		this.setComponent(component);
		this.#value = value;
		this.value$.subscribe(() => this.change());
	}

	setComponent(component) {
		if (component !== null && component !== undefined) {
			this.change = () => component.reload();
		} else {
			this.change = () => { };
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
