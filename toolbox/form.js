import { Component, getAllAttributesFrom } from '../core/components.js';
import { EventEmitter } from '../core/events.js';

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
	constructor(props) {
		super(props);
		this.__controlNames = {};
		this.__controlValidators = {};
	}

	addFieldControl(name, value) {
		this.__controlValidators[name] = {
			touched: value.touched || false,
			invalid: value.invalid || false,
			validate: value.validate || (() => ""),
			errorClassName: value.errorClassName || "",
			validatedClassName: value.validatedClassName || "",
			error: ""
		};
		Object.defineProperty(this.__controlNames, name, value);
	}

	setValue(controller, value) {
		const items = document.querySelectorAll(`${this.getSelector()}[controller=${controller}] input, ${this.getSelector()}[controller=${controller}] textarea`);

		if (this.getController(controller) !== undefined) {
			this.setControllerValue(controller, value);
		}
		for (const item of items) {
			item.value = value;
		}
	}

	setControllers(controls, append) {
		if (!append) {
			this.__controlNames = {};
		}
		for (const key in controls) {
			this.addFieldControl(key, controls[key]);
		}
	}

	getController(name) {
		return this.__controlNames[name];
	}

	setControllerValue(name, value) {
		this.__controlNames[name] = value;
	}

	__validate(name, touched) {
		const value = this.__controlNames[name];
		let ret = "";
		this.__controlValidators[name].error = ret;
		if (touched) {
			ret = this.__controlValidators[name].error = this.__controlValidators[name].validate(value);
		}
		this.__controlValidators[name].invalid = !!ret;
		return ret;
	}

	setTouched(name, touched) {
		this.__controlValidators[name].touched = touched;
		this.__validate(name, touched);
	}

	setAllTouched(touched) {
		for (const name in this.__controlValidators) {
			this.setTouched(name, touched);
		}
	}

	setValueAll(value) {
		for (const name in this.__controlValidators) {
			this.setValue(name, value);
		}
	}

	isTouched(name) {
		return this.__controlValidators[name].touched;
	}

	isInvalid(name) {
		return this.__controlValidators[name].invalid;
	}

	hasTouched() {
		for (const name in this.__controlValidators) {
			if (this.isTouched(name)) return true;
		}
		return false;
	}

	hasInvalid() {
		for (const name in this.__controlValidators) {
			if (this.isInvalid(name)) return true;
		}
		return false;
	}

	__onInput(target, ctrl) {
		if (target && ctrl) {
			this.setControllerValue(ctrl, target.value || "");
			target.value = this.getController(ctrl);

			if (this.__controlValidators[ctrl].touched) {
				this.__validate(ctrl, true);
			}
		}
	}

	__onBlur(target, ctrl) {
		if (target && ctrl) {
			this.setTouched(ctrl, true);
		}
	}

	__onCheckbox(target, ctrl) {
		if (target && ctrl) {
			this.setControllerValue(ctrl, target.checked || false);
			target.checked = this.getController(ctrl);
		}
	}

	__renderAttributes(attributes) {
		return attributes.map(
			attr => {
				if (attr.name == 'enabled') {
					if (attr.value) {
						return '';
					} else {
						return 'disabled';
					}
				}
				if (attr.name == 'checked') {
					if (attr.value) {
						return 'checked';
					} else {
						return '';
					}
				}
				return `${attr.name}="${
					Array.isArray(attr)
						?	attr.join(' ')
						:	attr.value
				}"`;
			}
		).join(' ');
	}
}

export class InputField extends FormFieldComponent
{
	constructor(controls) {
		super();
		this.__autocomplete = {};
		this.setControllers(controls);
	}

	addAutocomplete(name, get) {
		Object.defineProperty(this.__autocomplete, name, { get });
	}

	setAutocomplete(controls) {
		for (const key in controls) {
			this.addAutocomplete(key, controls[key]);
		}
	}

	updateAutocomplete(autocomplete) {
		const list = this.__autocomplete[autocomplete];
		const items = document.querySelectorAll(`${this.getSelector()} #__auto-complete-${autocomplete}`);

		for (const item of items) {
			item.innerHTML = list.map(option => `<option>${ option }</option>`).join('');
		}
	}

	setTouched(name, touched) {
		super.setTouched(name, touched);
		if (!touched) {
			this.__removeClasses(name);
		}
	}

	__setInputClasses(name, callback) {
		const controllerElements = document.querySelectorAll(`${this.getSelector()}[controller=${name}]`);
		controllerElements.forEach(element => {
			const errorClassName = this.__controlValidators[name].errorClassName;
			const validatedClassName = this.__controlValidators[name].validatedClassName;
			if (errorClassName || validatedClassName) {
				const input = element.querySelector("input, textarea");
				if (input) {
					const classes = getElementClasses(input, [ errorClassName, validatedClassName ]);
					if (callback) callback({ input, element, classes, errorClassName, validatedClassName });
					input.className = classes.join(" ");
				}
			}
		});
	}

	__validate(name, touched) {
		const ret = super.__validate(name, touched);
		this.__setInputClasses(name, ({input, element, classes, errorClassName, validatedClassName}) => {
			const small = element.querySelector("error-field small");
			if (small) small.innerHTML = ret;
			if (errorClassName || validatedClassName) {
				if (input) {
					if (ret) {
						if (errorClassName) classes.push(errorClassName);
					} else {
						if (validatedClassName) classes.push(validatedClassName);
					}
					input.className = classes.join(" ");
				}
			}
		});
		return ret;
	}

	__removeClasses(name) {
		this.__setInputClasses(name);
	}

	inputAttributes(options, controller) {
		const attributes = [];

		const defaultOptions = {
			type: 'text',
			events: ['oninput'],
			value: controller ? this.getController(controller) || "" : ""
		};

		for (const key in defaultOptions) {
			if (options[key] === undefined) {
				options[key] = defaultOptions[key];
			}
		}
		for (const key in options) {
			attributes.push({
				name: key,
				value: options[key]
			});
		}
		if (controller) {
			let onblur = false;
			for (const event of options.events) {
				if (event === "onblur") onblur = true;
				attributes.push({
					name: event,
					value: `this.component.__onInput(this, '${controller}')`
				});
			}
			if (!onblur) {
				attributes.push({
					name: "onblur",
					value: `this.component.__onBlur(this, '${controller}')`
				});
			}
		}
		return this.__renderAttributes(attributes);
	}

	render() {
		const controller = this.getAttribute("controller");
		const autocomplete = this.getAttribute("autocomplete");
		const list = autocomplete ? this.__autocomplete[autocomplete] : [];
		const options = {};

		const input = this.children.querySelector("input");
		const textarea = this.children.querySelector("textarea");
		const label = this.children.querySelector("label");
		const error = this.children.querySelector("error-field");
		let labelValue = "";
		let errorOptions = "";

		if (input) {
			const attr = getAllAttributesFrom(input);

			for (let key in attr) {
				options[key] = attr[key];
			}
			if (autocomplete) {
				options.list = "__auto-complete-" + autocomplete;
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
		if (error) {
			const attr = getAllAttributesFrom(error);
			errorOptions = Object.keys(attr).map(key => `${key}="${attr[key]}"`).join(' ');
		}
		return `${labelValue}<${textarea?'textarea':'input'} ${this.inputAttributes(options, controller)}>${textarea?`${options.value}</textarea>`:''}${autocomplete?`<datalist id="${options.list}">${list.map(option => `<option>${ option }</option>`).join('')}</datalist>`:""}<error-field><small ${errorOptions}></small></error-field>`;
	}
}

export class CheckBox extends FormFieldComponent
{
	constructor(controls) {
		super();
		this.setControllers(controls);
	}

	checkboxAttributes(options, controller) {
		const attributes = [];

		const defaultOptions = {
			type: 'checkbox',
			events: ['onchange'],
			checked: this.getController(controller)
		};

		for (const key in defaultOptions) {
			if (options[key] === undefined) {
				options[key] = defaultOptions[key];
			}
		}
		for (const key in options) {
			attributes.push({
				name: key,
				value: options[key]
			});
		}
		for (const event of options.events) {
			attributes.push({
				name: event,
				value: `this.component.__onCheckbox(this, '${controller}')`
			});
		}
		return this.__renderAttributes(attributes);
	}

	render() {
		const controller = this.getAttribute("controller");
		const input = this.children.querySelector("input");
		const label = this.children.querySelector("label");
		const options = {};
		let labelValue = "";

		if (input) {
			const attr = getAllAttributesFrom(input);

			for (let key in attr) {
				options[key] = attr[key];
			}
		}
		if (label) {
			const attr = getAllAttributesFrom(label);
			let attributes = Object.keys(attr).map(key => `${key}="${attr[key]}"`).join(' ');
			labelValue = `<label ${attributes}>${label.innerHTML}</label>`;
		}
		return `<input ${this.checkboxAttributes(options, controller)}>${labelValue}`;
	}
}

export class SelectField extends FormFieldComponent
{
	constructor(options) {
		super({
			default: []
		});
		this.onSelect = new EventEmitter("select", this);

		if (options !== undefined) {
			this.setSelectControllers(options);
		}
	}

	getOptions(property) {
		if (property === undefined || property === null) {
			property = "default";
		}
		return this[property];
	}

	addOption(control, text, value) {
		if (text === undefined || text === null) {
			text = control;
			control = "default";
		}
		if (value === undefined) {
			value = text;
		}
		const options = this[control] || [];
		options.push({ value, text });
		this.renderSelect(control, options);
	}

	setOptions(control, options) {
		this[control] = options;
		this.renderSelect(control, options);
	}

	renderSelect(control, options) {
		const items = document.querySelectorAll(`${this.getSelector()}[controller=${control}] select`);

		for (const item of items) {
			item.innerHTML = options.map(option => `<option value="${option.value}"${option.selected?" selected":""}>${option.text}</option>`).join('');
		}
	}

	setSelectControllers(controls) {
		const options = {};
		const controllers = {};
		Object.keys(controls).forEach(key => {
			options[key] = controls[key].options;
			controllers[key] = {
				get: () => controls[key].get ? controls[key].get() : "",
				set: value => controls[key].set ? controls[key].set(value) : undefined
			}
		});
		this.definePropertiesObject(options);
		this.setControllers(controllers);
	}

	onCreate() {
		const handler = this.getFunctionAttribute("select", "event");
		this.onSelect.then(handler);
	}

	setCurrentValue(value, control) {
		const options = this[control] || [];
		const option = options.find(o => o.value === value);

		options.forEach(o => o.selected = false);
		if (option) {
			option.selected = true;
		}
		this.renderSelect(control, options);
	}

	__select(event, control) {
		this.setControllerValue(control, event.target.value);
		const value = this.getController(control);
		this.setCurrentValue(value, control);
		this.onSelect.emit(value);
	}

	selectAttributes(options, name) {
		const attributes = [];

		for (const key in options) {
			attributes.push({
				name: key,
				value: options[key]
			});
		}
		attributes.push({
			name: "onchange",
			value: `this.component.__select(event,'${name}')`
		});
		return this.__renderAttributes(attributes);
	}

	afterReload(items) {
		for (const item of items) {
			const control = item.getAttribute("controller");
			const options = this[control] || [];
			this.renderSelect(control, options);
		}
	}

	render() {
		const control = this.getAttribute("controller");
		const select = this.children.querySelector("select");
		const label = this.children.querySelector("label");
		const attributes = {};
		let labelValue = "";

		if (select) {
			const attr = getAllAttributesFrom(select);

			for (let key in attr) {
				attributes[key] = attr[key];
			}
		}
		if (label) {
			const attr = getAllAttributesFrom(label);
			let attributes = Object.keys(attr).map(key => `${key}="${attr[key]}"`).join(' ');
			labelValue = `<label ${attributes}>${label.innerHTML}</label>`;
		}
		this.setCurrentValue(this.getController(control), control);
		return `${labelValue}<select ${this.selectAttributes(attributes,control)}></select>`
	}
}