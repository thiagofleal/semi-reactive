import { FormFieldComponent } from "./form-field.js";
import { getAllAttributesFrom } from "../utils/functions.js";

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
