import Component from './Component.js';

export default class Switch extends Component
{
	constructor(id) {
		super();
		this.components = {};
		this.id = id;
		this.selected = null;
	}

	getElement(selector) {
		return this.components[selector];
	}

	setElement(selector, value) {
		this.components[selector] = value;
	}

	register(component, selector, handlers) {
		component.disable();
		this.setElement(selector, component);
		this.appendChild(component, `#${this.id}`, handlers);
	}

	select(selector) {
		if (this.selected) {
			this.selected.disable();
		}
		this.selected = this.components[selector];
		this.selected.enable();
	}

	enable() {
		super.enable();
		if (this.selected) {
			this.selected.reload();
		}
	}

	render() {
		return `<div id="${this.id}"></div>`;
	}
}