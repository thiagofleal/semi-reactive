import { FormFieldComponent } from "./form-field.js";
import { getAllAttributesFrom } from "../utils/functions.js";

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
