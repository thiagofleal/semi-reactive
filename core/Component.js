import Property from './Property.js';

class ComponentEvent extends Event
{
	constructor(eventName, component) {
		super('component.' + eventName);
		this.component = component;
	}
}

export default class Component extends EventTarget
{
	constructor(enabled) {
		super();
		this.children = [];
		this.enabled = (enabled === null || enabled === undefined || enabled === true);
		this.dataset = {};
		this.__first = true;
	}

	render() {
		return '';
	}

	onFirst() {}

	show(selector) {
		this.selector = selector;
		this.reload();
	}

	__selectAll() {
		return document.querySelectorAll(this.selector);
	}

	reload() {
		if (this.enabled) {
			const result = this.__selectAll();
			
			const attrComponent = (el) => {
				el.component = this;

				for (let child of el.childNodes) {
					attrComponent(child);
				}
			}

			for (let el of result) {
				this.dataset = el.dataset;
				el.innerHTML = this.render();
				attrComponent(el);
			}
			this.__loadChildren();
			this.dispatchComponentEvent('reload');

			if (this.__first) {
				this.onFirst();
				this.__first = false;
			}
		}
		return this.enabled;
	}

	enable() {
		this.enabled = true;
		this.dispatchComponentEvent('enable');
		this.reload();
	}

	disable() {
		this.enabled = false;
		for (let el of this.__selectAll()) {
			el.innerHTML = '';
		}
		this.dispatchComponentEvent('disable');
	}

	property(value) {
		return new Property(value, this);
	}

	associateProperty(property) {
		return property.associate(this);
	}

	appendChild(child, selector, eventHandlers) {
		if (eventHandlers === undefined || eventHandlers === null) {
			eventHandlers = [];
		}
		this.children.push(child);
		child.show(selector);

		for (let handler of eventHandlers) {
			this.addEventListener(handler.on, handler.callback, handler.flag);
		}
	}

	__loadChildren() {
		for (let child of this.children) {
			child.reload();
		}
	}

	pageTitle(title) {
		document.querySelector('head title').innerHTML = title;
	}

	dispatchComponentEvent(eventName, listener) {
		super.addEventListener('component.' + eventName, listener);
	}

	dispatchComponentEvent(eventName) {
		super.dispatchEvent(new ComponentEvent(eventName, this));
	}
}