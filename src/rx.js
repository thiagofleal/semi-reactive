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

	static from(array) {
		return new Observable(observer => {
			for (let key in array) {
				observer.next(array[key]);
			}
			observer.complete();
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

	static fromEvent(emitter) {
		return {
			onMessage: () => new Observable(observer => {
				let unsubscriber = () => {};
				try {
					const onopen = emitter.onopen;
					const onmessage = emitter.onmessage;
					const onerror = emitter.onerror;
					const onclose = emitter.onclose;

					emitter.onopen = data => observer.next(data);
					emitter.onmessage = data => observer.next(data);
					emitter.onerror = err => observer.error(err);
					emitter.onclose = data => {
						observer.next(data);
						observer.complete();
					};
					
					unsubscriber = () => {
						emitter.onopen = onopen;
						emitter.onmessage = onmessage;
						emitter.onerror = onerror;
						emitter.onclose = onclose;
					};
				} catch (err) {
					observer.error(err);
				}
				return unsubscriber;
			}),
			onEvent: eventName => new Observable(observer => {
				let unsubscriber = () => {};
	
				try {
					const handler = event => observer.next(event);
					emitter.addEventListener(eventName, handler);
					unsubscriber = () => emitter.removeEventListener(eventName, handler);
				} catch (err) {
					observer.error(err);
				}
				return unsubscriber;
			})
		};
	}

	static fromEventSource(url) {
		return Observable.fromEvent(new EventSource(url));
	}
}