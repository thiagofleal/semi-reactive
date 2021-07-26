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
	}

	then(callback) {
		this.origin.addEventListener(this.eventName, callback);
	}

	emit(data) {
		const event = new Event(this.eventName);
		event.data = data;
		this.origin.dispatchEvent(event);
	}
}

export class Component extends EventTarget
{
	constructor(props, enabled) {
		super();
		this.__children = [];
		this.__enabled = (enabled === null || enabled === undefined || enabled === true);
		this.element = null;
		this.dataset = {};
		this.__first = true;
		this.__selector = null;
		this.definePropertiesObject(props || {});
	}

	render() {
		return '';
	}

	getSelector() {
		return this.__selector;
	}

	onFirst() {}

	show(selector) {
		this.__selector = selector;
		this.reload();
		this.dispatchComponentEvent("show");
	}

	__selectAll() {
		return document.querySelectorAll(this.__selector);
	}

	reload() {
		if (this.__enabled) {
			const result = this.__selectAll();
			
			const attrComponent = (elem) => {
				for (let child of elem.childNodes) {
					child.component = this;
					attrComponent(child);
				}
			};
			
			for (let item of result) {
				this.element = item;
				this.dataset = item.dataset;
				item.innerHTML = this.render();
				attrComponent(item);
			}
			this.__loadChildren();

			if (this.__first) {
				for (let item of result) {
					this.element = item;
					this.dataset = item.dataset;
					this.onFirst(item);
					this.__first = false;
				}
			}
		}
		return this.__enabled;
	}

	enable() {
		this.__enabled = true;
		this.dispatchComponentEvent('enable');
		this.reload();
	}

	disable() {
		this.__enabled = false;
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
		this.__children.push(child);
		child.show(selector);

		for (let handler of eventHandlers) {
			this.addEventListener(handler.on, handler.callback, handler.flag);
		}
	}

	__loadChildren() {
		for (let child of this.__children) {
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

	getAttribute(attr) {
		return this.element.getAttribute(attr);
	}

	getFunctionAttribute(attr, caller, ...args) {
		const func = this.getAttribute(attr);
		return function(...prmt) {
			return new Function(...args, func).call(caller, ...prmt);
		};
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
		const selected = this.getSelected();

		if (selected && selected.onUnselected) {
			selected.onUnselected();
		}
		if (key in this.__components) {
			this.__selectedKey = key;
			this.__components[key].show(this.__selector);

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

export class Router extends Switch
{
	constructor(props) {
		super(props);
		this.__routes = [];
		this.__urlPath = null;
	}

	getRoutes() {
		return this.__routes;
	}

	setRoutes(routes) {
		this.__routes = routes;

		for (const item of routes) {
			this.setComponent(item.path, item.component);
		}
	}

	getUrlPath() {
		if (this.__urlPath !== null) {
			return this.__urlPath;
		}

		return false;
	}

	setUrlPath(path) {
		this.__urlPath = path;
	}

	selectComponent(key, sub) {
		this.select(key);
		const selected = this.getSelected();

		if (selected) {
			if (selected instanceof Router) {
				selected.setUrlPath(sub);
				selected.loadPath();
			}
		}
	}

	reload() {
		super.reload();
		this.loadPath();
	}

	loadPath() {
		const path = this.getUrlPath();
		const currentPath = path.shift();
		const route = this.__routes.find(r => r.path === currentPath);

		if (route) {
			this.selectComponent(route.path, path);
		} else {
			const def = this.__routes.find(r => r.path === "*");

			if (def) {
				this.selectComponent(def.path, path);
			}
		}
	}
}

export class SimpleRouter extends Router
{
	constructor(props) {
		super(props);
		this.__init = false;
	}

	init() {
		window.addEventListener("hashchange", () => this.loadPath());
		this.__init = true;
	}

	setRoutes(routes) {
		super.setRoutes(routes);

		if (!this.__init) {
			this.init();
		}
	}

	getUrlPath() {
		const s_ret = super.getUrlPath();

		if (s_ret === false) {
			const hash = window.location.hash.replace(/^#\//, '');
			return hash.split('/');
		}

		return s_ret;
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