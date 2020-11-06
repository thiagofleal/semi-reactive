export default class Property
{
	change = (value) => {};
	_value = null;

	get value() {
		return this._value;
	}

	set value(value) {
		this._value = value;
		this.change(value);
	}

	constructor(prop, component) {
		this.setComponent(component);
		this.value = prop;
	}

	setComponent(component) {
		if (component !== null && component !== undefined) {
			this.change = (value) => component.reload();
		}
	}

	associate(component) {
		const ret = new Property(this.value);
		ret.change = (value) => {
			this.value = value;
			component.reload();
		};
		return ret;
	}
}