import Component from './Component.js';

export default class Switch extends Component
{
	constructor() {
		super();
		this.components = {};
	}

	setComponent(key, component) {
		this.components[key] = {
			component: component,
			selected: false
		};
	}

	getComponent(key) {
		if (key in this.components) {
			return this.components[key].component;
		}
		return null;
	}

	getSelected() {
		for (const key in this.components) {
			if (this.components[key].selected) {
				return this.components[key].component;
			}
		}
		return null;
	}

	select(key) {
		for (const key in this.components) {
			this.components[key].selected = false;
		}

		if (key in this.components) {
			this.components[key].selected = true;
			this.components[key].component.show(`#${this.dataset.id}`);
		}
	}

	reload() {
		super.reload();
		const selected = this.getSelected();

		if (selected) {
			selected.reload();
		}
	}

	render() {
		return `<div id="${this.dataset.id}"></div>`;
	}
}