import { Component } from "./component.js";
import { Observable } from "../../rx.js";

export class EventEmitter extends EventTarget
{
	constructor(eventName, component) {
		super();
		this.eventName = eventName;
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
		origin.addEventListener(this.eventName, callback);
		return () => origin.removeEventListener(this.eventName, callback);
	}

	emit(data) {
		if (typeof data !== "object" || !data.detail) {
			data = { detail: data };
		}
		this.component.getElement().dispatchEvent(new CustomEvent(this.eventName, data));
	}

	observe() {
		return new Observable(observer => {
			const origin = this.component.getElement();
			const callback = event => observer.next(event);
			origin.addEventListener(this.eventName, callback);
			return () => origin.removeEventListener(this.eventName, callback);
		});
	}

	initFromProperty(propertyName) {
		const callback = this.component.getFunctionAttribute(propertyName, "event");
		if (callback) {
			this.then(callback);
		}
	}
}
