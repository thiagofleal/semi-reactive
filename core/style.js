export class Style
{
	static createName(length) {
		const chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz";
		let ret = "";

		for (let i = 0; i < length; i++) {
			ret += chars.charAt(Math.ceil(Math.random() * chars.length));
		}
		return ret;
	}

	static __createStyle(css, selector, id) {
		if (!id) {
			id = selector.replace(/[^a-zA-Z\d\s:]/gi, '').replace(/\s/g, '');
		}
		let style = document.head.querySelector(`style#${id}`);

		if (!style) {
			style = document.createElement('style');
			style.id = id;
			document.head.append(style);
		}
		style.innerHTML = css.trim().split('&').map(element => {
			if (element && element.length) {
				return (selector + element).trim();
			}
			return "";
		}).join('\n');
	}

	static create(selector, css, id) {
		Style.__createStyle(css, selector, id);
	}

	static createClass(css) {
		const name = Style.createName(20);
		Style.__createStyle(css, "." + name);
		return name;
	}
}

export class StyledComponent
{
	constructor() {
		this.__selector = "";
	}

	show(selector) {
		this.__selector = selector;
		this.reload();
	}

	getSelector() {
		return this.__selector;
	}

	style() {
		return '';
	}

	callBeforeReload() {}

	reload() {
		const selector = this.getSelector();
		const style = this.style();
		if (selector && style) {
			Style.create(selector, style);
		}
	}
}

export class StylePlugin
{
	constructor(name) {
		this.name = name;
	}

	initPlugin(selector) {
		const style = this.style();
		Style.create(selector, style, 'style-plugin');
	}

	getName() {
		return this.name;
	}
}