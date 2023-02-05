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

	show(selector) {
		super.show(selector);

		if (this.#selectedKey) {
			this.select(this.#selectedKey);
		}
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
			this.#components[key].show(this.getSelector());
			this.#components[key].__setElement(this.getElement());

			if (this.#components[key].onSelected) {
				this.#components[key].onSelected();
			}
		}
	}

	reload() {
		const selected = this.getSelected();

		if (selected) {
			selected.reload();
		}
	}
}
