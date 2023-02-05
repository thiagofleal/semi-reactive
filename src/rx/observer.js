export class Observer {
	#subscribed = true;
	#unsubscribe = () => {};

	constructor(next, error, complete) {
		this.onNext = next ? next : () => { };
		this.onError = error ? error : () => { };
		this.onComplete = complete ? complete : () => { };
		this.setUnsubscribe();
	}

	setUnsubscribe(unsubscribe) {
		if (unsubscribe && typeof unsubscribe === "function") this.#unsubscribe = unsubscribe;
	}

	next(value) {
		if (this.#subscribed) {
			this.onNext(value);
		}
	}

	error(err) {
		if (this.#subscribed) {
			this.onError(err);
			this.unsubscribe();
		}
	}

	complete() {
		if (this.#subscribed) {
			this.onComplete();
			this.unsubscribe();
		}
	}

	unsubscribe() {
		this.#subscribed = false;
		this.#unsubscribe();
	}
}
