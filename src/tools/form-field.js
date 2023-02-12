import { Component } from "../../core.js";

import { getAllAttributesFrom, getElementClasses } from "../utils/functions.js";

export class FormFieldComponent extends Component
{
	#controllers = {};

	constructor(props, controllers) {
		super(props);
		this.setControllers(controllers || {});
	}

	setController(name, values) {
		this.#controllers[name] = {
			get: values.get || (() => ""),
			set: values.set || (() => void 0),
			errorClassName: values.errorClassName || "",
			validatedClassName: values.validatedClassName || "",
			validatedMessage: values.validatedMessage || "",
			validate: values.validate || (() => ""),
			touched: false,
			invalid: false
		};
	}

	getControllerProperty(controllerName, propertyName) {
		const controller = this.#controllers[controllerName];

		if (controller) {
			return controller[propertyName];
		}
	}
	setControllerProperty(controllerName, propertyName, value) {
		const controller = this.#controllers[controllerName];

		if (controller) {
			controller[propertyName] = value;
		}
	}

	setControllers(controllers, append) {
		if (!append) {
			this.#controllers = {};
		}
		for (const key in controllers) {
			this.setController(key, controllers[key]);
		}
	}

	getControllerValue(name) {
		return this.#controllers[name].get();
	}
	setControllerValue(name, value) {
		this.#controllers[name].set(value);
		this.onSetValue(name, this.getControllerValue(name));
		this.validate(name);
	}
	setValueAll(value) {
		for (const name in this.#controllers) {
			this.setControllerValue(name, value);
		}
	}

	getControllerTouched(name) {
		return this.#controllers[name].touched;
	}
	setControllerTouched(name, value) {
		this.#controllers[name].touched = value;
		this.validate(name);
	}
	setAllTouched(value) {
		for (const name in this.#controllers) {
			this.setControllerTouched(name, value);
		}
	}

	getFieldElement(controller) {
		return document.querySelector(`${ this.getSelector() }[controller=${ controller }]`);
	}

	getFieldElements(controller) {
		return document.querySelectorAll(`${ this.getSelector() }[controller=${ controller }]`) || [];
	}

	getControllerElements(controller) {
		return this.getFieldElement(controller).querySelectorAll(this.getFieldSelector());
	}

	validate(controllerName) {
		const controller = this.#controllers[controllerName];

		if (controller.touched) {
			const value = this.getControllerValue(controllerName);
			const elements = this.getFieldElements(controllerName);
			const error = controller.validate(value);

			controller.invalid = !!error;
			elements.forEach(element => {
				const field = element.querySelector(this.getFieldSelector());
				const classNames = getElementClasses(field, [
					controller.errorClassName,
					controller.validatedClassName
				]);
				const errorField = element.querySelector("error-field");
				const successField = element.querySelector("success-field");

				errorField.innerHTML = "";
				successField.innerHTML = "";

				if (error) {
					controller.errorClassName ? classNames.push(controller.errorClassName) : void 0;

					if (errorField) errorField.innerHTML = error;
				} else {
					controller.validatedClassName ? classNames.push(controller.validatedClassName) : void 0;

					if (controller.validatedMessage) {
						if (successField) successField.innerHTML = controller.validatedMessage;
					}
				}
				field.className = classNames.join(" ");
			});
		} else {
			const value = this.getControllerValue(controllerName);
			const elements = this.getFieldElements(controllerName);

			controller.invalid = false;
			elements.forEach(element => {
				const field = element.querySelector(this.getFieldSelector());
				const classNames = getElementClasses(field, [
					controller.errorClassName,
					controller.validatedClassName
				]);
				const errorField = element.querySelector("error-field");
				const successField = element.querySelector("success-field");

				if (errorField) errorField.innerHTML = "";
				if (successField) successField.innerHTML = "";

				field.className = classNames.join(" ");
			});
		}
	}

	renderAttributes(attributes) {
		return Object.keys(attributes).map(
			key => {
				if (key === "enabled") {
					if (attributes[key]) {
						return "";
					} else {
						return "disabled";
					}
				}
				if (key === "checked") {
					if (attributes[key]) {
						return "checked";
					} else {
						return "";
					}
				}
				return `${key}="${
					Array.isArray(attributes[key])
						?	attributes[key].join(" ")
						:	attributes[key]
				}"`;
			}
		).join(" ");
	}

	onCreate() {
		const controller = this.getAttribute("controller");
		const value = this.getControllerValue(controller);
		this.onSetValue(controller, value);
	}

	render() {
		const controller = this.getAttribute("controller");
		const element = this.getFieldElement(controller);
		const error = this.children.querySelector("error-field");
		const success = this.children.querySelector("success-field");
		let errorOptions = "";
		let successOptions = "";

		if (error) {
			const attr = getAllAttributesFrom(error);
			errorOptions = Object.keys(attr).map(key => `${key}="${attr[key]}"`).join(" ");
		}
		if (success) {
			const attr = getAllAttributesFrom(success);
			successOptions = Object.keys(attr).map(key => `${key}="${attr[key]}"`).join(" ");
		}
		return `${ this.renderField(controller) }<error-field ${errorOptions}></error-field><success-field ${successOptions}></success-field>`;
	}

	afterReload(result) {
		for (const item of result) {
			const controllerName = item.getAttribute("controller");
			const element = item.querySelector(this.getFieldSelector());
			const events = this.eventsToBind(element, controllerName);
			for (const key in events) {
				element.addEventListener(key, events[key]);
			}
		}
	}

	onSetValue(controller, value) {}

	getFieldSelector() {
		return "input";
	}

	renderField(controller) {
		return "";
	}

	eventsToBind(element, controller) {
		return {};
	}
}