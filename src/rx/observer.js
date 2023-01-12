export class Observer {
	constructor(next, error, complete) {
		this.__subscribed = true;
		this.onNext = next ? next : () => { };
		this.onError = error ? error : () => { };
		this.onComplete = complete ? complete : () => { };
		this.setUnsubscribe();
	}

	setUnsubscribe(unsubscribe) {
		this.__unsubscribe = unsubscribe ? unsubscribe : () => { };
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
