/**@import { SideBarItem } from "./SideBarItem.js" */
import { LitElement, css, html } from "@builtin/lit/client"

export class SideBarList extends LitElement {

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
        }
    `;

    constructor() {
        super();
        this.addEventListener("builtin-click", this.onClick, {
            capture: true
        });
    }

    /**
     * @param { Event } e 
     */
    onClick(e) {
        for (const element of /**@type { NodeListOf<SideBarItem> } */(this.querySelectorAll(":scope>builtin-sidebar-item"))) {
            if (element !== e.target) element.active = false;
        }
    }

    render(){
        return html`<slot></slot>`;
    }
}

customElements.define('builtin-sidebar-list', SideBarList);