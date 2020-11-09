export default class Service
{
	constructor(properties) {
		if (properties === null || properties === undefined) {
			properties = [];
		}
		this.properties = properties;
	}

	registerProperty(name, property) {
		this.properties[name] = property;
	}

	getProperty(name) {
		return this.properties[name];
	}
}