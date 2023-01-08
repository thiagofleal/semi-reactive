import { Component, getAllAttributesFrom } from '../core/components.js';

function getElementClasses(element, ignore) {
	if (!ignore) ignore = [];
	if (!Array.isArray(ignore)) ignore = [ignore];
	if (element) {
		return element.className.split(" ").filter(e => !ignore.includes(e));
	}
	return [];
}

export class FormFieldComponent extends Component
{
	constructor(props, controllers) {
		super(props);
		this.__controllers = {};
		this.setControllers(controllers || {});
	}

	setController(name, values) {
		this.__controllers[name] = {
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

	setControllers(controllers, append) {
		if (!append) {
			this.__controllers = {};
		}
		for (const key in controllers) {
			this.setController(key, controllers[key]);
		}
	}

	getControllerValue(name) {
		return this.__controllers[name].get();
	}
	setControllerValue(name, value) {
		this.__controllers[name].set(value);
		this.onSetValue(name, this.getControllerValue(name));
		this.validate(name);
	}
	setValueAll(value) {
		for (const name in this.__controllers) {
			this.setControllerValue(name, value);
		}
	}

	getControllerTouched(name) {
		return this.__controllers[name].touched;
	}
	setControllerTouched(name, value) {
		this.__controllers[name].touched = value;
		this.validate(name);
	}
	setAllTouched(value) {
		for (const name in this.__controllers) {
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
		const controller = this.__controllers[controllerName];

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

export class InputField extends FormFieldComponent
{
	constructor(controllers) {
		super({}, controllers);
	}

	onSetValue(controller, value) {
		const elements = this.getControllerElements(controller);
		elements.forEach(element => {
			element.value = value;
		});
	}

	getFieldSelector() {
		return "input, textarea";
	}

	renderField(controller) {
		const options = {};

		const input = this.children.querySelector("input");
		const textarea = this.children.querySelector("textarea");
		const label = this.children.querySelector("label");
		let labelValue = "";

		if (input) {
			const attr = getAllAttributesFrom(input);

			for (let key in attr) {
				options[key] = attr[key];
			}
		} else if (textarea) {
			const attr = getAllAttributesFrom(textarea);

			for (let key in attr) {
				options[key] = attr[key];
			}
		}
		if (label) {
			const attr = getAllAttributesFrom(label);
			let attributes = Object.keys(attr).map(key => `${key}="${attr[key]}"`).join(' ');
			labelValue = `<label ${attributes}>${label.innerHTML}</label>`;
		}
		return `${labelValue}<${textarea?'textarea':'input'} ${this.renderAttributes(options)}>${textarea?`${options.value || ""}</textarea>`:''}`;
	}

	eventsToBind(element, controller) {
		return {
			input: () => {
				this.setControllerValue(controller, element.value);
			},
			blur: () => {
				if (!this.getControllerTouched(controller)) {
					this.setControllerTouched(controller, true);
				}
			}
		}
	}
}

export class CheckBox extends FormFieldComponent
{
	constructor(controllers) {
		super({}, controllers);
	}

	onSetValue(controller, value) {
		const elements = this.getControllerElements(controller);
		elements.forEach(element => {
			element.checked = value;
		});
	}

	getFieldSelector() {
		return "input[type=checkbox]";
	}

	renderField(controller) {
		const options = {
			type: "checkbox"
		};

		const input = this.children.querySelector("input[type=checkbox]");
		const label = this.children.querySelector("label");
		let labelAttributes = {};
		let labelValue = "";

		if (input) {
			const attr = getAllAttributesFrom(input);

			for (let key in attr) {
				options[key] = attr[key];
			}
		}
		if (label) {
			const attr = getAllAttributesFrom(label);
			labelAttributes = Object.keys(attr).map(key => `${key}="${attr[key]}"`).join(' ');
			labelValue = label.innerHTML;
		}
		return `${labelValue?`<label ${labelAttributes}>`:""}<input ${this.renderAttributes(options)}/>${labelValue?`${labelValue}</label>`:""}`;
	}

	eventsToBind(element, controller) {
		return {
			input: () => {
				this.setControllerValue(controller, element.checked);
			},
			blur: () => {
				if (!this.getControllerTouched(controller)) {
					this.setControllerTouched(controller, true);
				}
			}
		}
	}
}

export class SelectField extends FormFieldComponent
{
	constructor(controllers) {
		super({}, controllers);
	}

	setController(name, values) {
		super.setController(name, values);
		this.__controllers[name].options = values.options || [];
	}

	getControllerOptions(controller) {
		return this.__controllers[controller].options;
	}
	setControllerOptions(controller, options) {
		this.__controllers[controller].options = options;
		this.reload();
	}

	onSetValue(controller, value) {
		const elements = this.getControllerElements(controller);
		elements.forEach(element => {
			element.value = value;
		});
	}

	getFieldSelector() {
		return "select";
	}

	renderField(controller) {
		const selectAttr = {};
		const optionAttr = {};

		const select = this.children.querySelector("select");
		const label = this.children.querySelector("label");
		const option = this.children.querySelector("option");
		const items = this.getControllerOptions(controller);
		let labelAttributes = {};
		let labelValue = "";

		if (select) {
			const attr = getAllAttributesFrom(select);

			for (let key in attr) {
				selectAttr[key] = attr[key];
			}
		}
		if (option) {
			const attr = getAllAttributesFrom(option);

			for (let key in attr) {
				optionAttr[key] = attr[key];
			}
			if (optionAttr.value) delete optionAttr.value;
		}
		if (label) {
			const attr = getAllAttributesFrom(label);
			labelAttributes = Object.keys(attr).map(key => `${key}="${attr[key]}"`).join(' ');
			labelValue = label.innerHTML;
		}
		return `${labelValue?`<label ${labelAttributes}>${labelValue}</label>`:""}<select ${this.renderAttributes(selectAttr)}>${items.map(option => `<option ${this.renderAttributes(optionAttr)} value="${option.value}">${option.label}</option>`)}</select>`;
	}

	eventsToBind(element, controller) {
		return {
			input: () => {
				this.setControllerValue(controller, element.value);
			},
			blur: () => {
				if (!this.getControllerTouched(controller)) {
					this.setControllerTouched(controller, true);
				}
			}
		}
	}
}
