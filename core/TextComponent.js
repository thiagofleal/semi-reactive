import Component from './Component.js';

export default class TextComponent extends Component
{
	constructor(text) {
		super();

		if (text === undefined || text === null) {
			text = "";
		}

		this.text = this.property(text);
	}

	render() {
		return `${this.dataset.text || this.text.value}`;
	}
}