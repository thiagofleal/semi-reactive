import { Component } from "../core/components.js";

export class Dropdown extends Component
{
    constructor() {
        super({
            __active: false
        });
    }

    toggle() {
        this.__active = !this.__active;
    }

    open() {
        if (! this.__active) {
            this.toggle();
        }
    }

    close() {
        if (this.__active) {
            this.toggle();
        }
    }

    register(attr) {
        for (const key in attr) {
            this[key] = attr[key];
        }
    }

    render() {
        const btn = this.getAttribute("btn-class") || "";
        const elementText = this.children.querySelector(".button-text");
        const text = elementText ? elementText.innerHTML : "";
        const elementMenu = this.children.querySelector(".dropdown-menu");
        const menu = elementMenu ? elementMenu.innerHTML : "";

        return `<div class="dropdown${ this.__active ? ' show' : ''}"><button class="btn ${ btn } dropdown-toggle" type="button" onclick="this.component.toggle()">${ text }</button><div class="dropdown-menu${ this.__active ? ' show' : '' }">${ menu }</div></div>`;
    }
}