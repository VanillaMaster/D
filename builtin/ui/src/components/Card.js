import { LitElement, css, html } from "@builtin/lit/client"

export class Card extends LitElement {

    static styles = css`
        :host {
            background-color: var(--color-surface-1);
            padding: 1em;
            border-radius: 1em;
            display: flex;
            flex-direction: column;
            gap: .5em;
        }

        .header {
            display: flex;
            gap: 1em;
            align-items: flex-end;
        }
    `;

    constructor() {
        super();
    }

    render(){
        return html`
            <div class="header">
                <slot name="header"></slot>
            </div>
            <div class="main">
                <slot></slot>
            </div>
            <div class="footer">
                <slot name="footer"></slot>
            </div>
        `;
    }

}
customElements.define('builtin-card', Card);