export class PropertySet {
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
