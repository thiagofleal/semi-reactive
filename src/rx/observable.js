import { Subscription } from "./subscription.js";
import { Observer } from "./observer.js";

export class Observable {
	#func = () => {};

	constructor(func) {
		this.#func = func;
	}

	subscribe(observer) {
		let next, error, complete;
		next = error = complete = () => { };
		if (typeof observer === "object") {
			if (observer.next) {
				next = observer.next;
			}
			if (observer.error) {
				error = observer.error;
			}
			if (observer.complete) {
				complete = observer.complete;
			}
		}
		if (typeof observer === "function") {
			next = observer;
		}
		const observe = new Observer(next, error, complete);
		const subscription = new Subscription();

		const ret = this.#func(observe);
		subscription.add(observe);

		if (typeof ret === "function") {
			observe.setUnsubscribe(ret);
		}
		return subscription;
	}

	toPromise() {
		return new Promise((resolve, failure) => {
			let resolveValue = undefined;
			this.subscribe({
				next: value => {
					resolveValue = value;
				},
				error: err => failure(err),
				complete: () => {
					resolve(resolveValue);
				}
			});
		});
	}

	pipe(transform) {
		return new Observable(observer => {
			const subscription = transform(this).subscribe({
				next: value => observer.next(value),
				error: err => observer.error(err),
				complete: () => observer.complete()
			});
			return () => subscription.unsubscribe();
		});
	}

	map(transform) {
		return new Observable(observer => {
			const subscription = this.subscribe({
				next: value => observer.next(transform(value)),
				error: err => observer.error(err),
				complete: () => observer.complete()
			});
			return () => subscription.unsubscribe();
		});
	}

	filter(condition) {
		return new Observable(observer => {
			const subscription = this.subscribe({
				next: value => {
					if (condition(value)) {
						observer.next(value);
					}
				},
				error: err => observer.error(err),
				complete: () => observer.complete()
			});
			return () => subscription.unsubscribe();
		});
	}

	first() {
		return new Observable(observer => {
			const subscription = this.subscribe({
				next: value => {
					observer.next(value);
					observer.complete();
				},
				error: err => observer.error(err),
				complete: () => observer.complete()
			});
			return () => subscription.unsubscribe();
		});
	}

	static from(src) {
		return new Observable(observer => {
			if (Array.isArray(src)) {
				for (let key in src) {
					observer.next(src[key]);
				}
				observer.complete();
			}
			if (src instanceof Promise) {
				src.then(value => {
					observer.next(value);
					observer.complete();
				}).catch(err => observer.error(err));
			}
		});
	}

	static interval(interv) {
		return new Observable(observer => {
			let i = 0;

			const id = setInterval(() => {
				observer.next(i++);
			}, interv);

			return () => clearInterval(id);
		});
	}

	static fromEvents(emitter, events) {
		if (!Array.isArray(events)) {
			events = [events];
		}
		return new Observable(observer => {
			const handler = event => observer.next(event);

			events.forEach(eventName => {
				emitter.addEventListener(eventName, handler);
			});
			return () => {
				events.forEach(eventName => {
					emitter.removeEventListener(eventName, handler)
				});
			};
		});
	}

	static fromEvent(emitter, eventName) {
		return Observable.fromEvent(emitter, [eventName]);
	}

	static fromEventSource(url, events) {
		const source = new EventSource(url);

		if (!Array.isArray(events)) {
			events = [events];
		}
		return new Observable(observer => {
			try {
				events.forEach(event => {
					source.addEventListener(event, evt => observer.next(evt));
				});
				source.onerror = err => {
					observer.error(err);
				};
			} catch (err) {
				observer.error(err);
			}
			return () => source.close();
		});
	}
}
