export class Style {
	static minify(content) {
		return content.replace(/\n/g, "")
			.replace(/\/\*.*?\*\//g, "")
			.replace(/\s+/g, " ")
			.replace(/\s\}/g, "}").replace(/\}\s/g, "}")
			.replace(/\s\{/g, "{").replace(/\{\s/g, "{")
			.replace(/\s\]/g, "]").replace(/\]\s/g, "]")
			.replace(/\s\[/g, "[").replace(/\[\s/g, "[")
			.replace(/\s:/g, ":").replace(/:\s/g, ":");
	}

	static create(css, prefix, posfix) {
		const value = Style.minify(css)
			.replace(/(\}|^|\{)[a-zA-Z0-9\-\s\[\],:\(\)*>="\.~\^\+]*(\{)/g, str => {
				return str.replace(/.+?(?=,|\{)/g, select => `${prefix}${select}${posfix}`);
			});
		const style = document.createElement("style");
		style.innerHTML = value;
		document.head.appendChild(style);
	}
}
