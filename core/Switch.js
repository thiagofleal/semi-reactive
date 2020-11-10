import Component from './Component.js';

export default class Switch extends Component
{
	constructor() {
		super();
		this.components = {};
		this.selected = this.property(null);
	}

	register(component, selector) {
		component.disable();
		this.components[selector] = component;
	}

	select(selector) {
		this.selected.value = this.components[selector];
		this.selected.value.show(this.selector);
	}

	render() {
		if (this.selected.value) {
			return this.selected.value.render();
		} else {
			return '';
		}
	}
}