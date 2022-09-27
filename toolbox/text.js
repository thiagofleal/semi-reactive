import { Component } from "../core/components.js";

export class TextComponent extends Component
{
	constructor(props) {
		if (props === undefined || props === null) {
			props = {};
		}
		props.default = "";
		super(props);
	}

	getText(property) {
		if (property === undefined || property === null) {
			property = "default";
		}
		return this[property];
	}

	setText(property, text) {
		if (text === undefined || text === null) {
			text = property;
			property = "default";
		}
		this[property] = '' + text;
	}

	setControls(controls) {
		this.definePropertiesObject(controls);
	}

	render() {
		const property = this.getAttribute("control") || "default";
		return this[property];
	}
}