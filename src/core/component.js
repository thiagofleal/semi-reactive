import { Property } from "./property.js";
import { PropertySet } from "./property-set.js";
import { Style } from "./style.js";
import { EventEmitter } from "./event-emitter.js";

import { createElement, getAllAttributesFrom, randomString } from "../utils/functions.js";

export class Component extends EventTarget
{
	#children = [];
	#enabled = true;
	#dataset = {};
	#first = true;
	#element = null;
	#selector = null;
	#properties = {};
	#parent = undefined;
	#id = "";
	#childNodes = {};
	#called_before_reload = false;

	constructor(props, enabled) {
		super();
		this.#enabled = (enabled === null || enabled === undefined || enabled === true);
		this.#id = `${ this.constructor.name }_${ randomString(5) }`;
		this.definePropertiesObject(props || {});
	}

	get element() {
		return this.getElement();
	}

	get dataset() {
		return this.#dataset;
	}

	get children() {
		return this.#childNodes[this.element];
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
		return this.#selector;
	}

	getId() {
		return this.#id;
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
		return this.#element;
	}
	__setElement(element) {
		this.#element = element;
	}

	closestOf(element) {
		return element.closest(this.getSelector());
	}

	show(selector) {
		this.#selector = selector;
		this.reload();
		this.onShow ? this.onShow() : undefined;
	}

	getAllItems() {
		return document.querySelectorAll(this.getSelector());
	}

	callBeforeReload() {
		if (!this.#called_before_reload) {
			this.beforeReload ? this.beforeReload() : undefined;
			this.#called_before_reload = true;
			this.#children.forEach(child => {
				child.callBeforeReload();
			});
		}
	}

	loadChildNode(item) {
		this.#childNodes[item] = createElement(item.innerHTML);
	}

	reload() {
		if (this.#enabled) {
			this.callBeforeReload();
			this.#called_before_reload = false;

			const result = this.getAllItems();
			const attrComponent = elem => {
				for (let child of elem.childNodes) {
					child._component = this;
					child._element = elem.closest(this.getSelector());
					if (!child.component) {
						Object.defineProperty(child, "component", {
							get: () => {
								this.#element = child._element;
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
				this.#element = item;
				this.#dataset = item.dataset;
				if (!item.__created) {
					this.loadChildNode(item);
				}
				item.innerHTML = this.render(item).trim();
				attrComponent(item);
				this.onReload ? this.onReload(item, this.#first) : undefined;
			}
			this.#loadChildren();

			for (let item of result) {
				if (!item.__created) {
					this.#element = item;
					this.#dataset = item.dataset;
					this.onCreate(item);
					item.__created = true;
				}
			}
			if (this.#first) {
				for (let item of result) {
					this.#element = item;
					this.#dataset = item.dataset;
					this.onFirst(item);
					this.#first = false;
				}
			}
			this.afterReload ? this.afterReload(result) : undefined;
		}
		return this.#enabled;
	}

	enable() {
		this.#enabled = true;
		this.reload();
		this.onEnable ? this.onEnable() : undefined;
	}

	disable() {
		this.#enabled = false;
		for (let el of this.getAllItems()) {
			el.innerHTML = '';
		}
		this.onDisable ? this.onDisable() : undefined;
	}

	getParent() {
		return this.#parent;
	}

	getProperty(name) {
		return this.#properties[name];
	}

	defineProperty(name, initial) {
		const prop = new Property(initial, this);
		
		Object.defineProperty(this, name, {
			get: () => prop.value,
			set: value => prop.value = value
		});
		return this.#properties[name] = prop;
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
		this.#children.push(child);
		child.#parent = this;
		child.show(`${selector}[component=${this.getId()}]`);

		for (let handler of eventHandlers) {
			this.addEventListener(handler.on, handler.callback, handler.flag);
		}
	}

	#loadChildren() {
		for (let child of this.#children) {
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
