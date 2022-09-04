function stackTrace() {
	const e = new Error();
	if (!e.stack) try {
		throw e;
	} catch (e) {
		if (!e.stack) {
			return [];
		}
	}
	const stack = e.stack.toString().split(/\r\n|\n/);
	stack.pop();
	return stack;
}

const styles = new Map();

export class Style {
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
		const stack = stackTrace();
		const src = stack[stack.length - 1];

		if (styles.has(src)) {
			return styles.get(src);
		}
		const name = Style.createName(20);
		Style.create("." + name, css);
		styles.set(src, name);
		return name;
	}
}

export class StyledComponent {
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

	callBeforeReload() { }

	reload() {
		const selector = this.getSelector();
		const style = this.style();
		if (selector && style) {
			Style.create(selector, style, this.constructor.name);
		}
	}
}

export class StylePlugin {
	constructor(name) {
		this.name = name;
	}

	apply(selector) {
		const style = this.__style();
		const elements = document.querySelectorAll(selector);

		if (elements) {
			elements.forEach(element => {
				element.className = [
					...element.className.split(' ').filter(n => n !== style),
					style
				].join(' ');
			});
		}
	}

	style() {
		return '';
	}

	__style() {
		return Style.createClass(this.style());
	}

	getName() {
		return this.name;
	}
}