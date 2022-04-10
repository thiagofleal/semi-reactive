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

	static createClass(css) {
		let style = document.head.querySelector('style');

		if (!style) {
			style = document.createElement('style');
			document.head.append(style);
		}
		const name = Style.createName(20);
		style.innerHTML += css.trim().split('&').map(element => {
			if (element && element.length) {
				return ("." + name + element).trim();
			}
			return "";
		}).join('\n');
		return name;
	}
}