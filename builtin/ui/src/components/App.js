import { LitElement, css, html } from "@builtin/lit/client"

export class App extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: relative;

            height: 100%;
            width: 100%;
        }
        .content {
            height: 100%;
            width: 100%;
            overflow-y: auto;
            overflow-x: hidden;
            display: grid;
            grid-template-rows: auto 1fr auto;
        }
        .header {
            position: sticky;
            top: 0;
            align-self: start;
        }
        .overlay {
            position: absolute;
            inset: 0;
            pointer-events: none;
        }
        .overlay-container {
            display: contents;
            pointer-events: initial;
        }
        /* :where(::slotted([slot=overlay])) {
            pointer-events: initial;
        } */
    `;
    render() {
        return html`
            <div class="content">
                <div class="header">
                    <slot name="header"></slot>
                </div>
                <div class="main">
                    <slot></slot>
                </div>
                <div class="footer">
                    <slot name="footer"></slot>
                </div>
            </div>
            <div class="overlay">
                <div class="overlay-container">
                    <slot name="overlay"></slot>
                </div>
            </div>
        `;
    }
}
customElements.define('builtin-app', App);