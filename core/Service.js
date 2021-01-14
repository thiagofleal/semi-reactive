export default class Service
{
	constructor(properties) {
		if (properties === null || properties === undefined) {
			properties = {};
		}
		this.functions = {};
		this.properties = properties;
	}

	registerProperty(name, property) {
		this.properties[name] = property;
	}

	getProperty(name) {
		return this.properties[name];
	}

	registerFunction(name, func) {
		this.function[name] = func;
	}

	getFunction(name) {
		if (name in this.function) {
			return this.function[name];
		}
		return () => {};
	}
}