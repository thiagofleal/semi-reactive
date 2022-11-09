import { Component } from "../core/components.js";

export class DialogComponent extends Component {
  constructor(options) {
    super({
      __active: false
    });
    this.onOpen = this.onClose = () => null;

    if (options === undefined) {
      options = {};
    }
    this.useStyle(`.dialog{display:none;position:fixed;z-index:1;padding-top:${options.top||"100px"};left:0;top:0;width:100%;height:100%;overflow:auto;margin:auto;}.dialog.show{display:block;}.dialog-content{position:relative;margin:auto;display:flex;flex-direction:column;max-width:100%;width:${options.width||"700px"};color:#000;pointer-events:auto;background-color:${options.background||"#fefefe"};background-clip:padding-box;border:none;border-radius:${options.borderRadius||"10px"};box-shadow:0 0 3px #000;outline:0;-webkit-animation-name:animatetop;-webkit-animation-duration:${options.duration||"0.3s"};animation-name:animatetop;animation-duration:${options.duration||"0.3s"}}@-webkit-keyframes animatetop{from{top:${options.animationFromTop||"-300px"};opacity:0}to{top:0;opacity:1}}@keyframes animatetop{from{top:${options.animationFromTop||"-300px"};opacity:0}to{top:0;opacity:1}}dialog-header{display:flex;flex-shrink:0;align-items:center;justify-content:space-between;padding:${options.headerPadding||"10px"};border-bottom:10px;border-radius:15px 15px 0 0;}dialog-body{position:relative;flex:1 1 auto;padding:10px;}dialog-footer{display:flex;flex-shrink:0;flex-wrap:wrap;align-items:center;justify-content:flex-end;padding:10px;border-radius:0 0 15px 15px;}`);
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

  async open() {
    this.__active = true;
    this.onOpen();
  }

  async close() {
    this.__active = false;
    this.onClose();
  }

  render() {
    return /*html*/`
      <div class="dialog ${this.getAttribute("dialog-class") || ''}${this.__active ? ' show' : ''}">
        <div class="dialog-content ${this.getAttribute("dialog-content-class") || ''}">
          ${this.children.innerHTML}
        </div>
      </div>
    `;
  }
}

export class DialogContainer extends Component {
  constructor(componentClass, ...args) {
    super();
    this.dialog = new ModalComponent();
    this.content = new componentClass(this, ...args);
    this.appendChild(this.dialog, "dialog-component");
    this.dialog.appendChild(this.content, "dialog-content");
  }

  open() {
    this.dialog.open();
  }

  close() {
    this.dialog.close();
  }

  setOnOpen(callback) {
    this.dialog.setOnOpen(callback);
  }

  setOnClose(callback) {
    this.dialog.setOnClose(callback);
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
    return /*html*/`
      <dialog-component>
        <dialog-content></dialog-content>
      </dialog-component>
    `;
  }
}
