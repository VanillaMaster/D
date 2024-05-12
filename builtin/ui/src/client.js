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

class App extends LitElement {
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

class SideBar extends LitElement {
    static properties = {
        open: {
            type: Boolean,
            reflect: true
        }
    };

    static styles = css`
    :host(*) {
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
        document.addEventListener("keypress", () => {
            this.toggle();
        });
    }

    toggle() {
        this.open = !this.open
    }

    close() {
        this.open = false;
    }

    render() {
        return html`
            <div class="backdrop" @click="${this.close}"></div>
            <div class="wrapper">
                <div class="container">
                    <slot></slot>
                </div>
            </div>
        `
    }
}

customElements.define('builtin-sidebar', SideBar);

class SideBarItem extends LitElement {
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
        }

        :host([active]) .backdrop {
            background-color: cadetblue;
        }

        button {
            all: unset;
            display: block;
            height: 100%;
            width: 100%;
        }
        .backdrop {
            height: 100%;
            width: 100%;

            display: flex;
            align-items: center;

            font-family: sans-serif;
            font-size: 14pt;
            line-height: 20pt;
            font-weight: 500;

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

class SideBarList extends LitElement {

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
        for (const element of this.children) {
            if (!(element instanceof SideBarItem)) continue;
            if (element !== e.target) element.active = false;
        }
    }

    render(){
        return html`<slot></slot>`;
    }
}

customElements.define('builtin-sidebar-list', SideBarList);


await (async function() {
    /**@param { Response } response */
    function text(response) {
        return response.text();
    }
    const { pathname: appPath } = new URL("./app.html", import.meta.url);
    const html = await fetch(appPath).then(text);
    const template = document.createElement("template");
    template.innerHTML = html;
    document.body.append(template.content);
})();