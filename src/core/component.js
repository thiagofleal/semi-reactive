import { Property } from "./property.js";
import { PropertySet } from "./property-set.js";
import { Style } from "./style.js";
import { EventEmitter } from "./event-emitter.js";

import { createElement, getAllAttributesFrom, randomString } from "../utils/functions.js";

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
		this.__id = `${ this.constructor.name }_${ randomString(5) }`;
		this.__childNodes = {};
		this.__styles = [];
		this.definePropertiesObject(props || {});
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
