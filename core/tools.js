import { Component } from "./components.js";

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
		return () => origin.removeEventListener(this.eventName, callback);
	}

	emit(data) {
		if (typeof data !== "object" || !data.detail) {
			data = { detail: data };
		}
		this.component.getElement().dispatchEvent(new CustomEvent(this.eventName, data));
	}
}