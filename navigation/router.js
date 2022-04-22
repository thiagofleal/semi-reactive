import { Switch } from "./components.js";

export class Router extends Switch
{
	constructor(props) {
		super(props);
		this.__routes = [];
		this.__urlPath = null;
	}

	getRoutes() {
		return this.__routes;
	}

	setRoutes(routes) {
		this.__routes = routes;

		for (const item of routes) {
			this.setComponent(item.path, item.component);
		}
	}

	getUrlPath() {
		if (this.__urlPath !== null) {
			return this.__urlPath;
		}

		return false;
	}

	setUrlPath(path) {
		this.__urlPath = path;
	}

	selectComponent(key, sub) {
		this.select(key);
		const selected = this.getSelected();

		if (selected) {
			if (selected instanceof Router) {
				selected.setUrlPath(sub);
				selected.loadPath();
			}
		}
	}

	reload() {
		super.reload();
		this.loadPath();
	}

	loadPath() {
		const path = this.getUrlPath();
		const currentPath = path.shift();
		const route = this.__routes.find(r => r.path === currentPath);

		if (route) {
			this.selectComponent(route.path, path);
		} else {
			const def = this.__routes.find(r => r.path === "*");

			if (def) {
				this.selectComponent(def.path, path);
			}
		}
	}
}

export class SimpleRouter extends Router
{
	constructor(props) {
		super(props);
		this.__init = false;
	}

	init() {
		window.addEventListener("hashchange", () => this.loadPath());
		this.__init = true;
	}

	setRoutes(routes) {
		super.setRoutes(routes);

		if (!this.__init) {
			this.init();
		}
	}

	getUrlPath() {
		const s_ret = super.getUrlPath();

		if (s_ret === false) {
			const hash = window.location.hash.replace(/^#\//, '');
			return hash.split('/');
		}

		return s_ret;
	}
}