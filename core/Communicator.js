export default class Communicator
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
		this.functions[name] = func;
	}

	getFunction(name) {
		if (name in this.functions) {
			return this.functions[name];
		}
		return () => null;
	}
}