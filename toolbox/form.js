import { Component, getAllAttributesFrom } from '../core/components.js';
import { EventEmitter } from '../core/events.js';

export class FormFieldComponent extends Component
{
	constructor(props) {
		super(props);
	}

	addFieldControl(name, value) {
		Object.defineProperty(this.__controlNames, name, value);
	}

	setValue(controller, value) {
		const items = document.querySelectorAll(`${this.getSelector()}[controller=${controller}] input`);

		for (const item of items) {
			if (this.__controlNames[controller] !== undefined) {
				this.__controlNames[controller] = value;
			}
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

	__onInput(target, ctrl) {
		if (target && ctrl) {
			this.__controlNames[ctrl] = target.value || "";
			target.value = this.__controlNames[ctrl];
		}
	}

	__onCheckbox(target, ctrl) {
		if (target && ctrl) {
			this.__controlNames[ctrl] = target.checked || false;
			target.checked = this.__controlNames[ctrl];
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

	inputAttributes(options, controller) {
		const attributes = [];

		const defaultOptions = {
			type: 'text',
			events: ['oninput'],
			value: controller ? this.__controlNames[controller] || "" : ""
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
			for (const event of options.events) {
				attributes.push({
					name: event,
					value: `this.component.__onInput(this, '${controller}')`
				});
			}
		}
		return this.__renderAttributes(attributes);
	}

	style() {
		return /*css*/`
			& {
				display: block;
			}
		`;
	}

	render() {
		const controller = this.getAttribute("controller");
		const autocomplete = this.getAttribute("autocomplete");
		const list = autocomplete ? this.__autocomplete[autocomplete] : [];
		const options = {};

		const input = this.children.querySelector("input");
		const label = this.children.querySelector("label");
		let labelValue = "";

		if (input) {
			const attr = getAllAttributesFrom(input);

			for (let key in attr) {
				options[key] = attr[key];
			}
			if (autocomplete) {
				options.list = "__auto-complete-" + autocomplete;
			}
		}
		if (label) {
			const attr = getAllAttributesFrom(label);
			let attributes = Object.keys(attr).map(key => `${key}="${attr[key]}"`).join(' ');
			labelValue = `<label ${attributes}>${label.innerHTML}</label>`;
		}
		return `${labelValue}<input ${this.inputAttributes(options, controller)}>${autocomplete?`<datalist id="${ options.list }">${list.map(option => `<option>${ option }</option>`).join('')}</datalist>`:""}`;
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
			checked: this.__controlNames[controller]
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
			this.setOptions(options);
		}
	}

	getOptions(property) {
		if (property === undefined || property === null) {
			property = "default";
		}
		return this[property];
	}

	setOption(property, text, value) {
		if (text === undefined || text === null) {
			text = property;
			property = "default";
		}
		if (value === undefined) {
			value = text;
		}
		const options = this[property] || [];
		options.push({ value, text });

		const items = document.querySelectorAll(`${this.getSelector()}[options=${property}] select`);

		for (const item of items) {
			item.innerHTML = options.map(option => `<option value="${ option.value }">${option.text}</option>`).join('');
		}
	}

	setOptions(options) {
		this.definePropertiesObject(options);
	}

	onCreate() {
		const handler = this.getFunctionAttribute("select", "event");
		this.onSelect.then(handler);
	}

	__select(event) {
		this.onSelect.emit(event.target.value);
	}

	selectAttributes(options) {
		const attributes = [];

		for (const key in options) {
			attributes.push({
				name: key,
				value: options[key]
			});
		}
		attributes.push({
			name: "onchange",
			value: `this.component.__select(event)`
		});
		return this.__renderAttributes(attributes);
	}

	render() {
		const control = this.getAttribute("options");
		const select = this.children.querySelector("select");
		const label = this.children.querySelector("label");
		const options = this[control] || [];
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
		return `${labelValue}<select ${this.selectAttributes(attributes)}>${options.map(option => `<option value="${ option.value }">${option.text}</option>`).join('')}</select>`
	}
}