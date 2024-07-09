import "@builtin/ui/client"

import { fetch as fetchProxy } from "@builtin/proxy/client"
import { XMLSaxStream } from "@builtin/parsing/xml"
import { fromNow } from "@builtin/ui/time"
import { setTitle } from "@builtin/ui/client";

const response = await fetchProxy("https://habr.com/ru/rss/articles/?fl=ru");
if (response.body == null) throw new Error();

const container = /**@type { HTMLElement } */(document.getElementById("builtin-body"));
const template = document.createElement("template");

setTitle("Habr.com");

response.body.pipeThrough(new TextDecoderStream("utf-8")).pipeThrough(new XMLSaxStream(["item"])).pipeTo(new WritableStream({
    write(node) {
        const { children: { title: { text: title }, description: { text: description }, pubDate: { text: pubDate}, "dc:creator": { text: creator }, link: { text: link}} } = node;
        template.innerHTML = `<builtin-feed-card>${description}</builtin-feed-card>`
        const img = template.content.querySelector("img");
        if (img == undefined) return;
        const { src } = img;
        template.innerHTML = `
            <builtin-card>
                <span slot="header" style="font-size: 1.2em;">${creator}</span>
                <span slot="header" style="font-weight: 400;">${ fromNow(new Date(pubDate)) }</span>
                <builtin-thumbnail style="height: 15em; border-radius: .5em; box-shadow: 0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 1px 3px 1px rgb(0 0 0 / 15%);" src="${src}"></builtin-thumbnail>
                <a slot="footer" href="${link}">${title}</a>
            </builtin-card>
        `;
        container.append(template.content);
    }
}))