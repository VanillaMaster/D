import { client } from "@builtin/rpc/client";

client.request("echo", { text: "Hello, World!" }).then(console.log);

import { LitElement, css, html } from "@builtin/lit/client"

class SimpleGreeting extends LitElement {
    static styles = css`p { color: blue }`;

    static properties = {
        name: { type: String },
    }

    constructor() {
        super();
        this.name = 'Somebody';
    }

    render() {
        return html`<p>Hello, ${this.name}!</p>`;
    }
}
customElements.define('simple-greeting', SimpleGreeting);

document.body.append(document.createElement("simple-greeting"));