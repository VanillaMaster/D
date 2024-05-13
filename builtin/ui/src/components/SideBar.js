import { LitElement, css, html } from "@builtin/lit/client"

export class SideBar extends LitElement {
    static properties = {
        open: {
            type: Boolean,
            reflect: true
        }
    };

    static styles = css`
    :host {
        display: block;
        position: relative;

        height: 100%;
        width: 100%;

        pointer-events: none;
    }
    .wrapper {
        position: absolute;
        top: 0;
        bottom: 0;

        overflow: hidden;

        display: grid;
        grid-template-columns: 0fr;
        
        transition-duration: 350ms;
        transition-timing-function: ease;
        transition-property: grid-template-columns;
    }
    .backdrop {
        position: absolute;
        inset: 0;
        background-color: transparent;
        transition: background-color 350ms linear;
    }

    :host([open]) {
        pointer-events: initial;
    }
    :host([open]) .wrapper {
        grid-template-columns: 1fr;
    }
    :host([open]) .backdrop {
        background-color: rgba(0, 0, 0, .3)
    }

    .container {
        min-width: 0;
        grid-column: 1 / span 2;
    }
    ::slotted(*) {
        min-width: max-content;
        float: right;
        pointer-events: initial
    }
    `;

    constructor() {
        super();
        this.open = false;
        document.addEventListener("builtin-sidebar-open", this.__open.bind(this));
    }

    __toggle() {
        this.open = !this.open
    }

    __close() {
        this.open = false;
    }
    __open() {
        this.open = true;
    }

    render() {
        return html`
            <div class="backdrop" @click="${this.__close}"></div>
            <div class="wrapper">
                <div class="container">
                    <slot></slot>
                </div>
            </div>
        `
    }
}

customElements.define('builtin-sidebar', SideBar);