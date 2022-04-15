export class Subscription
{
	constructor() {
		this.__subscriptions = [];
	}

	add(subscription) {
		this.__subscriptions.push(subscription);
	}

	unsubscribe() {
		this.__subscriptions.forEach(subscription => subscription.unsubscribe());
	}
}

export class Observer
{
	constructor(next, error, complete) {
		this.__subscribed = true;
		this.onNext = next ? next : () => {};
		this.onError = error ? error : () => {};
		this.onComplete = complete ? complete : () => {};
		this.setUnsubscribe();
	}

	setUnsubscribe(unsubscribe) {
		this.__unsubscribe = unsubscribe ? unsubscribe : () => {};
	}

	next(value) {
		if (this.__subscribed) {
			this.onNext(value);
		}
	}

	error(err) {
		if (this.__subscribed) {
			this.onError(err);
			this.unsubscribe();
		}
	}

	complete() {
		if (this.__subscribed) {
			this.onComplete();
			this.unsubscribe();
		}
	}

	unsubscribe() {
		this.__subscribed = false;
		this.__unsubscribe();
	}
}

export class Observable
{
	constructor(func) {
		this.__func = func;
	}

	subscribe(observer) {
		let next, error, complete;
		next = error = complete = () => {};
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

		const ret = this.__func(observe);
		subscription.add(observe);

		if (typeof ret === "function") {
			observe.setUnsubscribe(ret);
		}
		return subscription;
	}

	toPromise() {
		return new Promise((resolve, failure) => {
			const subscription = this.subscribe({
				next: value => {
					resolve(value);
					subscription.unsubscribe();
				},
				error: err => failure(err)
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

	map(pipeable) {
		return new Observable(observer => {
			const subscription = this.subscribe({
				next: value => observer.next(pipeable(value)),
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
