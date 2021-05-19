export class Property
{
	change = (value) => {};
	__value = null;

	get value() {
		return this.__value;
	}

	set value(value) {
		this.__value = value;
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

export class EventEmitter extends EventTarget
{
	constructor(eventName, origin) {
		super();
		if (eventName === undefined || eventName === null) {
			const chars = "abcdefghijklmnopqrstuvwxyz";
			const length = 10;
			eventName = '';

			for (let i = 0; i < length; i++) {
				const i = Math.floor(Math.random() * length);
				eventName += chars.charAt(i);
			}
		}

		if (origin === undefined || origin === null) {
			origin = this;
		}

		this.eventName = eventName;
		this.origin = origin;
		this.event = new Event(eventName);
	}

	then(callback) {
		this.origin.addEventListener(this.eventName, callback);
	}

	emit() {
		this.origin.dispatchEvent(this.event);
	}
}

export class Component extends EventTarget
{
	constructor(props, enabled) {
		super();
		this.children = [];
		this.enabled = (enabled === null || enabled === undefined || enabled === true);
		this.dataset = {};
		this.definePropertiesObject(props || {});
		this.__first = true;
	}

	render() {
		return '';
	}

	onFirst() {}

	show(selector) {
		this.selector = selector;
		this.reload();
		this.dispatchComponentEvent("show");
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

	defineProperty(name, initial) {
		const prop = this.property(initial);
		
		Object.defineProperty(this, name, {
			get: () => prop.value,
			set: value => prop.value = value
		});
	}

	definePropertiesObject(obj) {
		for (const key in obj) {
			this.defineProperty(key, obj[key]);
		}
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
		this.__functions = {};
		this.__properties = properties;
	}

	registerProperty(name, property) {
		this.__properties[name] = property;
	}

	getProperty(name) {
		return this.__properties[name];
	}

	registerFunction(name, func) {
		this.__functions[name] = func;
	}

	getFunction(name) {
		if (name in this.__functions) {
			return this.__functions[name];
		}
		return () => null;
	}
}

export class Switch extends Component
{
	constructor(props) {
		super(props);
		this.__components = {};
		this.__selectedKey = null;
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
		if (key in this.__components) {
			this.__selectedKey = key;
			this.__components[key].show(this.selector);
		}
	}

	reload() {
		const selected = this.getSelected();

		if (selected) {
			selected.reload();
		}
	}
}

export class TextComponent extends Component
{
	constructor(text, props) {
		if (props === undefined || props === null) {
			props = {};
		}
		if (text === undefined || text === null) {
			text = "";
		}

		props.text__value = text;
		super(props);
	}

	setText(text) {
		this.text__value = '' + text;
	}

	render() {
		return this.dataset.text || this.text__value;
	}
}