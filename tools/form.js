import { Component } from '../core/components.js';
import { EventEmitter } from '../core/tools.js';

export class FormFieldComponent extends Component
{
	constructor(props) {
		super(props);
	}

	addFieldControl(name, value) {
		Object.defineProperty(this.__controlNames, name, value);
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

	inputAttributes(options, controller) {
		const attributes = [];

		const defaultOptions = {
			type: 'text',
			events: ['oninput'],
			value: this.__controlNames[controller] || ""
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
				value: `this.component.__onInput(this, '${controller}')`
			});
		}
		return this.__renderAttributes(attributes);
	}

	render() {
        const attr = this.getAllAttributes();
		const controller = this.getAttribute("controller");
		const options = {};
		const regex = /^input-/i;
		const autocomplete = this.getAttribute("autocomplete");
		const list = this.__autocomplete[autocomplete];

		for (let key in attr) {
			if (regex.test(key)) {
				options[key.replace(regex, "")] = attr[key];
			}
		}
		if (autocomplete) {
			options.list = "__auto-complete-" + autocomplete;
		}
        return /*html*/`
			<input ${ this.inputAttributes(options, controller) }>
			${ autocomplete
				? /*html*/`
					<datalist id="${ options.list }">
						${
							list.map(option => /*html*/`
								<option>${ option }</option>
							`).join('')
						}
					</datalist>
				` : ""
			}
		`;
	}
}

export class CheckBox extends FormFieldComponent
{
	constructor(controls) {
		super();
		this.setControllers(controls);
	}

	setAutocomplete(controls) {
		for (const key in controls) {
			this.addAutocomplete(key, controls[key]);
		}
	}

	inputAttributes(options, controller) {
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
        const attr = this.getAllAttributes();
		const controller = this.getAttribute("controller");
		const options = {};
		const regex = /^input-/i;
		
		for (let key in attr) {
			if (regex.test(key)) {
				options[key.replace(regex, "")] = attr[key];
			}
		}
		return /*html*/`
			<input ${ this.inputAttributes(options, controller) }>
		`;
	}
}

export class SelectField extends FormFieldComponent
{
	constructor() {
		super({
			default: []
		});
		this.onSelect = new EventEmitter("select", this);
	}

	getOptions(property) {
		if (property === undefined || property === null) {
			property = "default";
		}
		return this[property];
	}

	setOptions(property, text) {
		if (text === undefined || text === null) {
			text = property;
			property = "default";
		}
		this[property] = '' + text;
	}

	setControls(controls) {
		this.definePropertiesObject(controls);
	}

	onFirst(element) {
		const handler = this.getFunctionAttribute("select", element, "event");
		this.onSelect.then(handler);
	}

	__select(event) {
		this.onSelect.emit(event.target.value);
	}

	render() {
		const control = this.getAttribute("options");
		const options = this[control];
		const allAttr = this.getAllAttributes();
		const attributes = [];
		const regex = /^select-/i;

		for (let key in allAttr) {
			if (regex.test(key)) {
				attributes.push({
					name: key.replace(regex, ""),
					value: allAttr[key]
				});
			}
		}

		return /*html*/`
			<select ${this.__renderAttributes(attributes)} onchange="this.component.__select(event)">
				${
					options.map(
						option => /*html*/`
							<option value="${ option.value }">
								${ option.text }
							</option>
						`
					).join('')
				}
			</select>
		`
	}
}