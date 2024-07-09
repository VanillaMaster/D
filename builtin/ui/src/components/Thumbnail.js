import { LitElement, css, html } from "@builtin/lit/client"

export class Thumbnail extends LitElement {

    static properties = {
        src: {
            type: String,
            reflect: true
        }
    }

    static styles = css`
        :host {
            position: relative;
            isolation: isolate;

            display: flex;
            align-items: center;
            justify-content: center;

            overflow: hidden;

            border-radius: .5em;
            box-shadow: 0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 1px 3px 1px rgb(0 0 0 / 15%);
        }

        .background {
            position: absolute;
            inset: 0;

            z-index: -1;

            height: 100%;
            width: 100%;

            object-fit: cover;
            object-position: center center;

            filter: blur(1em);
        }

        .foreground {
            max-height: 100%;
            max-width: 100%;

            display: block;
            margin: auto;
        }
    `;

    constructor() {
        super();
        this.src = "";
    }

    render(){
        return html`
            <img class="background" src="${this.src}">
            <img class="foreground" src="${this.src}">
        `;
    }

}
customElements.define('builtin-thumbnail', Thumbnail);