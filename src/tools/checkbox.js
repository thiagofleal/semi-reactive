import { FormFieldComponent } from "./form-field.js";
import { getAllAttributesFrom } from "../utils/functions.js";

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
