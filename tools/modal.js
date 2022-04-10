import { Component } from "../core/components.js";
import { modalStyle } from "./style/modal.js";

export class ModalComponent extends Component {
    constructor(contentClass, ...args) {
        super({
            __active: false
        });
        this.onOpen = this.onClose = () => null;
        this.__content = new contentClass(this, ...args);
    }

    show(selector) {
        super.show(selector);
        this.appendChild(
            this.__content,
            `${selector}>.modal>.modal-dialog>.modal-content`
        )
    }

    getContent() {
        return this.__content;
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
        return /*html*/`
            <div class="${modalStyle}">
                <div class="modal ${this.getAttribute("modal-class") || ''} ${this.__active ? 'd-block show' : 'd-none'}" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog ${this.getAttribute("modal-dialog-class") || ''}" role="document">
                        <div class="modal-content ${this.getAttribute("modal-content-class") || ''}"></div>
                    </div>
                </div>
                <div class="modal-backdrop fade show ${this.__active ? 'd-block' : 'd-none'}"></div>
            </div>
		`;
    }
}