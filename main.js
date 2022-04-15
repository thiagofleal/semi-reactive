import { Injectable } from "./core/service.js";

export class SemiReactive
{
	static start(args) {
		let component = args.component;
		const target = args.target;
		const load = args.load;
		const inject = args.inject;

		if (component && target) {
			component.show(target);
		}
		if (target && load) {
			load.then(loaded => {
				loaded.show(target);
			});
		}
		if (Array.isArray(inject)) {
			for (const service of inject) {
				if (service instanceof Promise) {
					service.then(Class_ => Injectable.register(Class_));
				} else {
					Injectable.register(service);
				}
			}
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
};