import { Component } from "./component.js";

export class Switch extends Component
{
	constructor(props) {
		super(props);
		this.__components = {};
		this.__selectedKey = null;
		this.__selected = null;
	}

	get selectedKey() {
		return this.__selectedKey;
	}

	show(selector) {
		super.show(selector);

		if (this.__selectedKey) {
			this.select(this.__selectedKey);
		}
	}

	getAllComponents() {
		const ret = [];

		for (const key in this.__components) {
			ret.push(this.__components[key]);
		}
		return ret;
	}

	setComponent(key, component) {
		this.__components[key] = component;
	}

	getComponent(key) {
		if (key in this.__components) {
			return this.__components[key];
		}
		return null;
	}

	getSelected() {
		if (this.__selectedKey) {
			return this.__components[this.__selectedKey];
		}
		return null;
	}

	select(key) {
		if (this.__selected && this.__selected.onUnselected) {
			this.__selected.onUnselected();
		}
		if (key in this.__components) {
			this.__selectedKey = key;
			this.__selected = this.__components[key];
			this.__components[key].show(this.__selector);
			this.__components[key].__element = this.getElement();

			if (this.__components[key].onSelected) {
				this.__components[key].onSelected();
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
