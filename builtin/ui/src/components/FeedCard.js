import { LitElement, css, html } from "@builtin/lit/client"

class FeedCard extends LitElement {
    static styles = css`
        :host {
            display: block;
            max-width: 20em;
            padding: 1em;
            border-radius: 1em;

            background-color: var(--color-surface-1);

            font-family: sans-serif;
            font-size: 14pt;
            line-height: 20pt;
            font-weight: 500;

            text-align: justify
        }
    `

    render() {
        return html`
            <slot></slot>
        `;
    }
}
customElements.define('builtin-feed-card', FeedCard);