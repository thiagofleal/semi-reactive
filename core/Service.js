export default class Service
{
	constructor(properties) {
		if (properties === null || properties === undefined) {
			properties = [];
		}
		this.properties = properties;
	}

	registerProperty(name, property) {
		this.properties.push({
			propertyName: name,
			propertyValue: property
		});
	}

	getProperty(name) {
		for (let p of this.properties) {
			if (p.propertyName == name) {
				return p.propertyValue;
			}
		}

		return null;
	}
}