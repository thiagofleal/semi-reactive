var SemiReactive = {
	script: document.currentScript,

	scriptFileName: function() {
		return this.script.src;
	},
	frameworkPath: function() {
		return this.scriptFileName().replace("include.js", "src/");
	},
	import: function(filename) {
		return require(this.frameworkPath() + filename);
	}
};

var link = document.createElement("link");

link.type = "text/css";
link.rel = "stylesheet";
link.href = `${SemiReactive.frameworkPath()}css/semi-reactive.css`

document.head.append(link);

var meta = document.createElement("meta");

meta.name = "viewport";
meta.content = "width=device-width, initial-scale=1.0";

document.head.append(meta);

var script = document.createElement("script");

script.type = "module";
script.innerHTML = `
	import("${SemiReactive.script.getAttribute('component-file')}").then(module => {
		const construct = module.default;
		const component = new construct();
		component.show("${SemiReactive.script.getAttribute('target')}");
	});
`;

document.head.append(script);