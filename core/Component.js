import Property from './Property.js';

export default class Component
{
	constructor(enabled) {
		this.children = [];
		this.enabled = (enabled === null || enabled === undefined || enabled === true);
		this.reload();
	}

	render() {
		return '';
	}

	show(selector) {
		this.selector = selector;
		this.reload();
	}

	reload() {
		if (this.enabled) {
			const result = document.querySelectorAll(this.selector);
			
			const attrComponent = (el) => {
				el.component = this;

				for (let child of el.childNodes) {
					attrComponent(child);
				}
			}

			for (let el of result) {
				el.innerHTML = this.render();
				attrComponent(el);
			}
			this.loadChildren();
		}
	}

	enable() {
		this.enabled = true;
		this.reload();
	}

	disable() {
		this.enabled = false;
		for (let el of document.querySelectorAll(this.selector)) {
			el.innerHTML = '';
		}
	}

	property(value) {
		return new Property(value, this);
	}

	associateProperty(property) {
		return property.associate(this);
	}

	appendChild(child, selector) {
		this.children.push(child);
		child.show(selector);
	}

	loadChildren() {
		for (let child of this.children) {
			child.reload();
		}
	}

	pageTitle(title) {
		document.querySelector('head title').innerHTML = title;
	}
}