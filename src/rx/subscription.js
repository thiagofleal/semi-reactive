export class Subscription {
	#subscriptions = [];

	add(subscription) {
		this.#subscriptions.push(subscription);
	}

	unsubscribe() {
		this.#subscriptions.forEach(subscription => subscription.unsubscribe());
	}
}
