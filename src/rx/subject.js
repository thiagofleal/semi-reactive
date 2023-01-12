import { Observable } from "./observable.js";

export class Subject extends Observable {
	constructor() {
		super(observer => {
			this.observers.push(observer);
			return () => {
				const index = this.observers.indexOf(observer);
				this.observers.splice(index, 1);
			};
		});
		this.observers = [];
	}

	next(value) {
		this.observers.forEach(observer => observer.next(value));
	}

	error(err) {
		this.observers.forEach(observer => observer.error(err));
	}

	complete() {
		this.observers.forEach(observer => observer.complete());
	}
}
