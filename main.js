import { Injectable } from "./core/service.js";

export class SemiReactive
{
	static async start(args) {
		let component = args.component;
		const target = args.target;
		const load = args.load;
		const inject = args.inject;

		if (target && load) {
			const loaded = await load;
			loaded.show(target);
		}
		if (Array.isArray(inject)) {
			for (const service of inject) {
				if (service instanceof Promise) {
					Injectable.register(await service);
				} else {
					Injectable.register(service);
				}
			}
		}
		if (component && target) {
			let instance;

			try {
				instance = new component();
			} catch (e) {
				if (typeof component === "function") {
					instance = component();
				} else {
					instance = component;
				}
			}
			instance.show(target);
		}
	}

	static instanceDefault(...args) {
		return module => {
			return new module.default(...args);
		}
	}

	static fromDefault() {
		return module => {
			return module.default;
		}
	}

	static instanceRoot(className, ...args) {
		return () => new className(...args);
	}
};