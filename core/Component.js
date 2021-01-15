import Property from './Property.js';

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
			
			const attrComponent = (elem) => {
				elem.component = this;

				for (let child of elem.childNodes) {
					attrComponent(child);
				}
			}

			for (let item of result) {
				this.dataset = item.dataset;
				item.innerHTML = this.render();
				attrComponent(item);
			}
			this.__loadChildren();
			this.dispatchComponentEvent('reload');

			if (this.__first) {
				for (let item of result) {
					this.dataset = item.dataset;
					this.onFirst(item);
				}
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

	addComponentEventListener(eventName, listener) {
		this.addEventListener('component.' + eventName, listener);
	}

	dispatchComponentEvent(eventName) {
		const event = new Event('component.' + eventName);
		event.component = this;
		this.dispatchEvent(event);
	}
}