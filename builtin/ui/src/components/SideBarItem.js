import { LitElement, css, html } from "@builtin/lit/client"

export class SideBarItem extends LitElement {
    static properties = {
        active: {
            type: Boolean,
            reflect: true
        }
    };

    constructor() {
        super();

        this.active = false;
    }

    static styles = css`
        :host {
            height: 56px;

            font-family: sans-serif;
            font-size: 14pt;
            line-height: 20pt;
            font-weight: 500;
        }

        :host([active]) .backdrop {
            background-color: var(--color-accent-1);
        }

        button {
            all: unset;
            display: block;
            height: 100%;
            width: 100%;

            cursor: pointer;
        }
        button:focus-visible .backdrop {
            outline: 1px solid var(--color-accent-2)
        }

        .backdrop {
            height: 100%;
            width: 100%;

            display: flex;
            align-items: center;

            padding: 0 24px 0 16px;
            box-sizing: border-box;
            border-radius: 9999px;
        }
    `;

    onClick() {
        this.active = true;
        this.dispatchEvent(new Event("builtin-click", {
            bubbles: true
        }));
    }

    render(){
        return html`
            <button @click=${this.onClick}>
                <div class="backdrop">
                    <slot name="icon"></slot>
                    <slot name="label"></slot>
                </div>
            </button>
        `;
    }
}

customElements.define('builtin-sidebar-item', SideBarItem);