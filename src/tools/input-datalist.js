import { FormFieldComponent } from "./form-field.js";
import { getAllAttributesFrom } from "../utils/functions.js";

export class InputDatalistField extends FormFieldComponent
{
	constructor(controllers) {
		super({}, controllers);
	}

	setController(name, values) {
		super.setController(name, values);
		this.setControllerProperty(name, "datalist", values.datalist || []);
	}

	getControllerDatalist(controller) {
		return this.getControllerProperty(controller, "datalist");
	}
	setControllerDatalist(controller, datalist) {
		this.setControllerProperty(controller, "datalist", datalist);
		const elements = this.getDatalistElements(controller);
		elements.forEach(element => {
			element.innerHTML = datalist.map(item => `<option value="${item}"></option>`)
		});
	}

	getDatalistId(controller) {
		return `${this.getId()}-${controller}`;
	}

	getDatalistElements(controller) {
		return document.querySelectorAll(`${this.getSelector()}[controller=${controller}] datalist`);
	}

	onSetValue(controller, value) {
		const elements = this.getControllerElements(controller);
		elements.forEach(element => {
			element.value = value;
		});
	}

	getFieldSelector() {
		return "input";
	}

	renderField(controller) {
		const options = {
			list: this.getDatalistId(controller)
		};

		const input = this.children.querySelector("input");
		const label = this.children.querySelector("label");
		const datalist = this.getControllerDatalist(controller);
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
		return `${labelValue}<input ${this.renderAttributes(options)}/><datalist id="${options.list}">${datalist.map(item => `<option value="${item}"></option>`)}</datalist>`;
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
