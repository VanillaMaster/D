import { LitElement, css, html } from "@builtin/lit/client"

export class ActionButton extends LitElement {

    static properties = {
        action: {
            type: String,
            reflect: true
        },
        target: {
            type: String,
            reflect: true
        }
    }

    static styles = css`
        :host {
            height: 48px;
            width: 48px;
        }

        button {
            all: unset;
            height: 100%;
            width: 100%;
            line-height: 0;
            display: grid;
            justify-items: center;
            align-items: center;
            cursor: pointer;
        }

        button:focus-visible {
            outline: 1px solid var(--color-accent-2)
        }
    `;

    constructor() {
        super();
        this.action = "none";
        /**
         * @type { "self" | "window" | "document" }
         */
        this.target = "self"
    }

    /**
     * @param { Event } e 
     */
    onClick(e) {
        switch (this.target) {
            case "self": return void this.dispatchEvent(new Event(`builtin-${this.action}`, {
                bubbles: true
            }));
            case "window": return void window.dispatchEvent(new Event(`builtin-${this.action}`));
            case "document": return void document.dispatchEvent(new Event(`builtin-${this.action}`));
        }
    }

    render(){
        return html`<button @click=${this.onClick}><slot></slot></button>`;
    }

}
customElements.define('builtin-action-button', ActionButton);