import { Component } from "../core/components.js";

export default class Toast extends Component
{
    constructor() {
        super();
        this.time = 2000;
        this.showToast = true;
    }

    async open(message, css_class) {
        const toast = document.querySelector(`${this.getSelector()}>.toast`);
        
        if (toast) {
            while (!this.showToast) {
                await sleep(100);
            }
            this.showToast = false;
            toast.innerHTML = message;
            const classes = `${toast.className || ""}`.split(' ');
            toast.className = [...classes, (css_class || ""), "show"].join(' ');
            await new Promise(r => setTimeout(r, this.time));
            toast.className = classes.join(' ');
            this.showToast = true;
        }
    }

    style() {
        return /*css*/`
            & .toast {
                visibility: hidden;
                min-width: 250px;
                margin-left: -125px;
                background-color: #333;
                color: #fff;
                text-align: center;
                border-radius: 5px;
                padding: 16px;
                position: fixed;
                z-index: 10000;
                left: 50%;
                bottom: 30px;
                font-size: 17px;
            }
            
            & .toast.show {
                visibility: visible;
                -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
                animation: fadein 0.5s, fadeout 0.5s 2.5s;
            }

            @keyframes fadein {
                from {
                    bottom: 0;
                    opacity: 0;
                }
                to {
                    bottom: 30px;
                    opacity: 1;
                }
            }

            @-webkit-keyframes fadeout {
                from {
                    bottom: 30px;
                    opacity: 1;
                } 
                to {
                    bottom: 0;
                    opacity: 0;
                }
            }

            @keyframes fadeout {
                from {
                    bottom: 30px;
                    opacity: 1;
                }
                to {
                    bottom: 0;
                    opacity: 0;
                }
            }
        `;
    }

    render() {
        return /*html*/`
            <div class="toast ${ this.getAttribute("toast-class") || "" }"></div>
        `;
    }
}