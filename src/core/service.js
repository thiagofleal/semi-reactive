import { Subject } from "../../rx.js";

export class Service {
  constructor() {
    this.events$ = new Subject();
  }

  onRegister() { }

  onGet() { }

  notify(event) {
    this.events$.next(event);
  }

  events() {
    return this.events$;
  }
}