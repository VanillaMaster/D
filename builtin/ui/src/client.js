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

{
    const { pathname: path } = new URL("./app.xml", import.meta.url);
    const res = await fetch(path);
    const parser = new DOMParser();
    const { children } = parser.parseFromString(await res.text(), "text/xml"); 
    document.body.append(...children);
}