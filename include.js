var SemiReactive = {
	script: document.currentScript,

	scriptFileName: function() {
		return this.script.src;
	},
	frameworkPath: function() {
		return this.scriptFileName().replace("include.js", "src/");
	},
	import: async function(filename) {
		return await import(this.frameworkPath() + filename);
	}
};

document.writeln(
	/*html*/`<link type="text/css" rel="stylesheet" href="${ SemiReactive.frameworkPath() }css/semi-reactive.css">`
);
document.writeln(
	/*html*/`<meta name="viewport" content="width=device-width, initial-scale=1.0">`
);

document.writeln(
	/*html*/`<script type="module">
		const construct = (await import("${ SemiReactive.script.getAttribute('component-file') }")).default;
		const component = new construct();
		component.show("${ SemiReactive.script.getAttribute('target') }");
	</script>`
);