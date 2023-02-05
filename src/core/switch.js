import { Component } from "./component.js";

export class Switch extends Component
{
	#components = {};
	#selectedKey = null;
	#selected = null;

	constructor(props) {
		super(props);
	}

	get selectedKey() {
		return this.#selectedKey;
	}

	getAllComponents() {
		const ret = [];

		for (const key in this.#components) {
			ret.push(this.#components[key]);
		}
		return ret;
	}

	setComponent(key, component) {
		this.#components[key] = component;
		this.appendChild(component, "switch-content");
		component.disable();
	}

	getComponent(key) {
		if (key in this.#components) {
			return this.#components[key];
		}
		return null;
	}

	getSelected() {
		if (this.#selectedKey) {
			return this.#components[this.#selectedKey];
		}
		return null;
	}

	select(key) {
		if (this.#selected && this.#selected.onUnselected) {
			this.#selected.onUnselected();
		}
		if (key in this.#components) {
			this.#selectedKey = key;
			this.#selected = this.#components[key];
			this.#components[key].enable();

			if (this.#components[key].onSelected) {
				this.#components[key].onSelected();
			}
		}
	}

	render() {
		const allAttributes = this.getAllAttributes();
		const attributes = Object.keys(allAttributes)
			.map(key => `${ key }="${ allAttributes[key] }"`)
			.join(" ");
		return `<switch-content ${ attributes }></switch-content>`
	}
}
