export class Subscription {
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
