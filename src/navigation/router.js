import { Switch } from "../../core.js";

export class Router extends Switch
{
	constructor(props) {
		super(props);
		this.#routes = [];
		this.#urlPath = null;
	}

	getRoutes() {
		return this.#routes;
	}

	setRoutes(routes) {
		this.#routes = routes;

		for (const item of routes) {
			this.setComponent(item.path, item.component);
		}
	}

	getUrlPath() {
		if (this.#urlPath !== null) {
			return this.#urlPath;
		}

		return false;
	}

	setUrlPath(path) {
		this.#urlPath = path;
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
		const route = this.#routes.find(r => r.path === currentPath);

		if (route) {
			this.selectComponent(route.path, path);
		} else {
			const def = this.#routes.find(r => r.path === "*");

			if (def) {
				this.selectComponent(def.path, path);
			}
		}
	}
}
