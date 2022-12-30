import { Component } from "../core/components.js";

export class ModalComponent extends Component {
    constructor() {
        super({
            __active: false
        });
        this.onOpen = this.onClose = () => null;
        this.useStyle(`.modal.show{display:block;}`);
    }

    onCreate() {
        const onOpen = this.getFunctionAttribute("onOpen", "event");
        const onClose = this.getFunctionAttribute("onClose", "event");

        if (onOpen) {
            this.onOpen = onOpen;
        }
        if (onClose) {
            this.onClose = onClose;
        }
    }

    setOnOpen(callback) {
        this.onOpen = callback;
    }

    setOnClose(callback) {
        this.onClose = callback;
    }

    register(object) {
        for (const key in object) {
            this[key] = object[key];
        }
    }

    open() {
        this.__active = true;
        this.onOpen();
    }

    close() {
        this.__active = false;
        this.onClose();
    }

    render() {
        return `<div class="modal ${this.getAttribute("modal-class") || ''} ${this.__active ? 'show' : ''}" tabindex="-1" role="dialog" aria-hidden="true"><div class="modal-dialog ${this.getAttribute("modal-dialog-class") || ''}" role="document"><div class="modal-content ${this.getAttribute("modal-content-class") || ''}">${this.children.innerHTML}</div></div></div>${this.__active?`<div class="modal-backdrop fade show"></div>`: ""}`;
    }
}

export class ModalContainer extends Component {
    constructor(componentClass, ...args) {
        super();
        this.modal = new ModalComponent();
        this.content = new componentClass(this, ...args);
        this.appendChild(this.modal, "modal-component");
        this.modal.appendChild(this.content, "modal-content");
    }

    open() {
        this.modal.open();
    }

    close() {
        this.modal.close();
    }

    setOnOpen(callback) {
        this.modal.setOnOpen(callback);
    }

    setOnClose(callback) {
        this.modal.setOnClose(callback);
    }

    register(fields) {
        for (const key in fields) {
            this[key] = fields[key];
        }
    }

    getContent() {
        return this.content;
    }

    render() {
        return `<modal-component><modal-content></modal-content></modal-component>`;
    }
}