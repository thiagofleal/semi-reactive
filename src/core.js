export class Property
{
	get value() {
		return this.__value;
	}

	set value(value) {
		this.__value = value;
		this.change(value);
	}

	constructor(value, component) {
		this.change = () => {};
		this.setComponent(component);
		this.__value = value;
	}

	setComponent(component) {
		if (component !== null && component !== undefined) {
			this.change = () => component.reload();
		}
	}

	associate(property) {
		if (property && property instanceof Property) {
			property.value = this.value;
			const change = this.change;
			this.change = () => {
				change();
				property.value = this.value;
			};
		}
	}
}

export class EventEmitter extends EventTarget
{
	constructor(eventName, component) {
		super();
		this.eventName = eventName;
		this.__listeners = [];
		this.setComponent(component);
	}

	get component() {
		return this.__component;
	}

	setComponent(component) {
		if (component instanceof Component) {
			this.__component = component;
		}
	}

	then(callback) {
		const origin = this.component.getElement();
		this.__listeners.push(callback);
		origin.addEventListener(this.eventName, callback);
	}

	emit(data) {
		if (typeof data !== "object" || !data.detail) {
			data = { detail: data };
		}
		this.component.getElement().dispatchEvent(new CustomEvent(this.eventName, data));
	}
}

export class Component extends EventTarget
{
	constructor(props, enabled) {
		super();
		this.__children = [];
		this.__enabled = (enabled === null || enabled === undefined || enabled === true);
		this.__element = null;
		this.__dataset = {};
		this.__first = true;
		this.__selector = null;
		this.__properties = {};
		this.__parent = undefined;
		this.definePropertiesObject(props || {});
	}

	get element() {
		return this.getElement();
	}

	get dataset() {
		return this.__dataset;
	}

	render() {
		return '';
	}

	getSelector() {
		return this.__selector;
	}

	onFirst() {}
	onCreate() {}

	getElement() {
		return this.__element;
	}

	closestOf(element) {
		return element.closest(this.getSelector());
	}

	show(selector) {
		this.__selector = selector;
		this.reload();
		this.onShow ? this.onShow() : undefined;
	}

	__selectAll() {
		return document.querySelectorAll(this.__selector);
	}

	callBeforeReload() {
		if (!this.__called_before_reload) {
			this.beforeReload ? this.beforeReload() : undefined;
			this.__called_before_reload = true;
			this.__children.forEach(child => {
				child.callBeforeReload();
			});
		}
	}

	reload() {
		if (this.__enabled) {
			this.callBeforeReload();
			this.__called_before_reload = false;

			const result = this.__selectAll();
			const attrComponent = elem => {
				for (let child of elem.childNodes) {
					child._component = this;
					child._element = elem.closest(this.getSelector());
					Object.defineProperty(child, "component", {
						get: () => {
							this.__element = child._element;
							return child._component;
						}
					})
					attrComponent(child);
				}
			};
			
			for (let item of result) {
				this.__element = item;
				this.__dataset = item.dataset;
				item.innerHTML = this.render(item).trim();
				attrComponent(item);
				this.onReload ? this.onReload(item, this.__first) : undefined;
			}
			this.__loadChildren();

			for (let item of result) {
				if (!item.__created) {
					this.__element = item;
					this.__dataset = item.dataset;
					this.onCreate(item);
					item.__created = true;
				}
			}
			if (this.__first) {
				for (let item of result) {
					this.__element = item;
					this.__dataset = item.dataset;
					this.onFirst(item);
					this.__first = false;
				}
			}
			this.afterReload ? this.afterReload() : undefined;
		}
		return this.__enabled;
	}

	enable() {
		this.__enabled = true;
		this.reload();
		this.onEnable ? this.onEnable() : undefined;
	}

	disable() {
		this.__enabled = false;
		for (let el of this.__selectAll()) {
			el.innerHTML = '';
		}
		this.onDisable ? this.onDisable() : undefined;
	}

	getParent() {
		return this.__parent;
	}

	getProperty(name) {
		return this.__properties[name];
	}

	defineProperty(name, initial) {
		const prop = new Property(initial, this);
		
		Object.defineProperty(this, name, {
			get: () => prop.value,
			set: value => prop.value = value
		});
		return this.__properties[name] = prop;
	}

	definePropertiesObject(obj) {
		for (const key in obj) {
			this.defineProperty(key, obj[key]);
		}
	}

	associateProperty(name, src) {
		let property = this.getProperty(name);

		if (!property) {
			property = this.defineProperty(name, null);
		}
		src.associate(property);
	}

	associateProperties(properties) {
		for (const key in properties) {
			this.associateProperty(key, properties[key]);
		}
	}

	appendChild(child, selector, eventHandlers) {
		if (eventHandlers === undefined || eventHandlers === null) {
			eventHandlers = [];
		}
		this.__children.push(child);
		child.__parent = this;
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

	getAttribute(attr) {
		return this.element.getAttribute(attr);
	}

	getAllAttributes() {
		const attributes = {};
		Array.from(this.element.attributes).forEach(
			attr => attributes[attr.nodeName] = attr.nodeValue
		);
		return attributes;
	}

	getFunctionAttribute(attr, caller, ...args) {
		const func = this.getAttribute(attr);
		return function(...prmt) {
			return new Function(...args, func).call(caller, ...prmt);
		};
	}
	
	attribute(name) {
		const attr = {
			set: (element, value) => {
				element[name] = value;
			},
			get: element => {
				return element[name];
			}
		};
		Object.defineProperty(this, name, {
			get: () => attr
		});
	}
}

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
	constructor(props) {
		if (props === undefined || props === null) {
			props = {};
		}
		props.default = "";
		super(props);
	}

	getText(property) {
		if (property === undefined || property === null) {
			property = "default";
		}
		return this[property];
	}

	setText(property, text) {
		if (text === undefined || text === null) {
			text = property;
			property = "default";
		}
		this[property] = '' + text;
	}

	setControls(controls) {
		this.definePropertiesObject(controls);
	}

	render() {
		const property = this.getAttribute("control") || "default";
		return this[property];
	}
}