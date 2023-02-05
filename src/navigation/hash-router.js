import { Router } from "./router.js";

export class HashRouter extends Router
{
	constructor(props) {
		super(props);
		this.#init = false;
	}

	init() {
		window.addEventListener("hashchange", () => this.loadPath());
		this.#init = true;
	}

	setRoutes(routes) {
		super.setRoutes(routes);

		if (!this.#init) {
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
