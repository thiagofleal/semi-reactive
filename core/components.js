import { Property, PropertySet } from "./properties.js";
import { Style } from "./style.js";
import { EventEmitter } from "./events.js";

function createElement(str) {
	const elem = document.createElement('div');
	elem.innerHTML = str;
	return elem;
}

export function getAllAttributesFrom(element) {
	const attributes = {};
	Array.from(element.attributes).forEach(attr => {
		attributes[attr.nodeName] = attr.nodeValue;
	});
	return attributes;
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
		this.__id = this.createId(5);
		this.__childNodes = {};
		this.__styles = [];
		delete this.createId;
		this.definePropertiesObject(props || {});
	}

	createId(length) {
		const chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789";
		let ret = `${this.constructor.name}_`;

		for (let i = 0; i < length; i++) {
			ret += chars.charAt(Math.ceil(Math.random() * chars.length));
		}
		return ret;
	}

	get element() {
		return this.getElement();
	}

	get dataset() {
		return this.__dataset;
	}

	get children() {
		return this.__childNodes[this.element];
	}

	render() {
		return '';
	}

	useStyle(style) {
		Style.create(style, {
			prefix: "",
			posfix: `[component=${this.getId()}]`
		});
	}

	useStylePropagate(style) {
		Style.create(style, [
			{
				prefix: "",
				posfix: `[component=${this.getId()}]`
			},
			{
				prefix: `[component=${this.getId()}] `,
				posfix: ""
			}
		]);
	}

	getSelector() {
		return this.__selector;
	}

	getId() {
		return this.__id;
	}

	querySelector(query) {
		if (this.element) {
			return this.element.querySelector(`[component=${this.getId()}]>${query}`);
		}
		return document.querySelector(`[component=${this.getId()}]>${query}`)
	}

	querySelectorAll(query) {
		if (this.element) {
			return this.element.querySelectorAll(`[component=${this.getId()}]>${query}`);
		}
		return document.querySelectorAll(`[component=${this.getId()}]>${query}`)
	}

	onFirst() {}
	onCreate() {}

	createEventEmitter(event) {
		return new EventEmitter(event, this);
	}

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

	getAllItems() {
		return document.querySelectorAll(this.getSelector());
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

	loadChildNode(item) {
		this.__childNodes[item] = createElement(item.innerHTML);
	}

	reload() {
		if (this.__enabled) {
			this.callBeforeReload();
			this.__called_before_reload = false;

			const result = this.getAllItems();
			const attrComponent = elem => {
				for (let child of elem.childNodes) {
					child._component = this;
					child._element = elem.closest(this.getSelector());
					if (!child.component) {
						Object.defineProperty(child, "component", {
							get: () => {
								this.__element = child._element;
								return child._component;
							}
						});
					}
					if (child.setAttribute && typeof child.setAttribute === "function") {
						child.setAttribute("component", this.getId());
					}
					attrComponent(child);
				}
			};
			
			for (let item of result) {
				this.__element = item;
				this.__dataset = item.dataset;
				if (!item.__created) {
					this.loadChildNode(item);
				}
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
			this.afterReload ? this.afterReload(result) : undefined;
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
		for (let el of this.getAllItems()) {
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

	addPropertySet(propertySet, ...properties) {
		for (const name of properties) {
			const property = this.getProperty(name);
			propertySet.set(name, property);
		}
	}

	createPropertySet(...properties) {
		const ret = new PropertySet();
		this.addPropertySet(ret, ...properties);
		return ret;
	}

	usePropertySet(propertySet) {
		for (const item of propertySet.getAll()) {
			this.associateProperty(item.key, item.property);
		}
	}

	appendChild(child, selector, eventHandlers) {
		if (eventHandlers === undefined || eventHandlers === null) {
			eventHandlers = [];
		}
		this.__children.push(child);
		child.__parent = this;
		child.show(`${selector}[component=${this.getId()}]`);

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
		let element = document.querySelector('head title');

		if (!element) {
			element = document.createElement('title');
			document.head.append(element);
		}
		element.innerHTML = title;
	}

	getAttribute(attr) {
		return this.element.getAttribute(attr);
	}

	getAllAttributes() {
		return getAllAttributesFrom(this.element);
	}

	getFunctionAttribute(attr, ...args) {
		const func = this.getAttribute(attr);
		const element = this.getElement();
		return func ? function(...prmt) {
			return new Function(...args, func).call(element, ...prmt);
		} : null;
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

	onEvent(event, callback) {
		this.addEventListener(event, callback);
		return () => this.removeEventListener(event, callback);
	}

	emit(event, data) {
		if (typeof data !== "object" || !data.detail) {
			data = { detail: data };
		}
		this.dispatchEvent(new CustomEvent(event, data));
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