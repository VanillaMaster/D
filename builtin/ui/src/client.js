import "./components/ActionButton.js"
import "./components/App.js"
import "./components/SideBar.js"
import "./components/SideBarItem.js"
import "./components/SideBarList.js"
import "./components/FeedCard.js"
import "./components/Thumbnail.js"
import "./components/Card.js"

import { client } from "@builtin/rpc/client";

client.request("echo", { text: "Hello, World!" }).then(console.log);


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

import { fetch as fetchProxy } from "@builtin/proxy/client"
import { XMLSaxStream } from "@builtin/parsing/xml"

(async function() {

    const response = await fetchProxy("https://habr.com/ru/rss/articles/?fl=ru");
    if (response.body == null) throw new Error(); 
    const container = /**@type { HTMLElement } */(document.getElementById("tmp-body"));
    const template = document.createElement("template");
    const rtf = new Intl.RelativeTimeFormat();
    const promise = response.body.pipeThrough(new TextDecoderStream("utf-8")).pipeThrough(new XMLSaxStream(["item"])).pipeTo(new WritableStream({
        write(node) {
            // console.log(node);
            const { children: { title: { text: title }, description: { text: description }, pubDate: { text: pubDate}, "dc:creator": { text: creator }, link: { text: link}} } = node;
            template.innerHTML = `<builtin-feed-card>${description}</builtin-feed-card>`
            const img = template.content.querySelector("img");
            if (img == undefined) return;
            const { src } = img;
            template.innerHTML = `
                <builtin-card>
                    <span slot="header" style="font-size: 1.2em;">${creator}</span>
                    <span slot="header" style="font-weight: 400;">${ rtf.format(Math.trunc((new Date(pubDate).getTime() - Date.now()) / 3.6e+6), "hour") }</span>
                    <builtin-thumbnail style="height: 15em; border-radius: .5em; box-shadow: 0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 1px 3px 1px rgb(0 0 0 / 15%);" src="${src}"></builtin-thumbnail>
                    <a slot="footer" href="${link}">${title}</a>
                </builtin-card>
            `;
            container.append(template.content);
            // else console.warn("no img");
        }
    }))
})()
