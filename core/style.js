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

	static create(css, options) {
		if (!options) {
			options = [];
		}
		if (!Array.isArray(options)) {
			options = [options];
		}
		const value = Style.minify(css)
			.replace(/(\}|^|\{)[a-zA-Z0-9\-\s\[\],:\(\)*>="\.~\^\+]*(\{)/g, str => {
				return str.replace(/.+?(?=,|\{)/g, inner => {
					return inner.replace(/[a-zA-Z0-9\-\s\[\]:\(\)*>="\.~\^\+]{1,}/g, select => {
						return options.map(({ prefix, posfix }) => {
							return ["from", "to"].includes(select)
								? `${select}`
								: `${prefix}${select}${posfix}`;
						}).join(',');
					});
				});
			});
		const style = document.createElement("style");
		style.innerHTML = value;
		document.head.appendChild(style);
	}
}
