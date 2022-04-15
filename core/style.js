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

	static __createStyle(css, selector) {
		const id = selector.replace(/[^a-zA-Z\d\s:]/gi, '').replace(/\s/g, '');
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

	static create(selector, css) {
		Style.__createStyle(css, selector);
	}

	static createClass(css) {
		const name = Style.createName(20);
		Style.__createStyle(css, "." + name);
		return name;
	}
}