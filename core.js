export class Property
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

export class Component extends EventTarget
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

export class Communicator
{
	constructor(properties) {
		if (properties === null || properties === undefined) {
			properties = {};
		}
		this.functions = {};
		this.properties = properties;
	}

	registerProperty(name, property) {
		this.properties[name] = property;
	}

	getProperty(name) {
		return this.properties[name];
	}

	registerFunction(name, func) {
		this.functions[name] = func;
	}

	getFunction(name) {
		if (name in this.functions) {
			return this.functions[name];
		}
		return () => null;
	}
}

export class Switch extends Component
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

export class TextComponent extends Component
{
	constructor(text) {
		super();

		if (text === undefined || text === null) {
			text = "";
		}

		this.text = this.property(text);
	}

	render() {
		return `${this.dataset.text || this.text.value}`;
	}
}