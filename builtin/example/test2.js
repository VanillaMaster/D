/**@import { XMLNode } from "@builtin/parsing/xml" */
import "@builtin/ui/client"
import { fetch as fetchProxy } from "@builtin/proxy/client"
import { XMLSaxStream } from "@builtin/parsing/xml"
import { fromNow } from "@builtin/ui/time"
import { setTitle } from "@builtin/ui/client";

setTitle("habr + ixbt");

const [r1, r2] = await Promise.all([
    fetchProxy("https://www.ixbt.com/export/news.rss"),
    fetchProxy("https://habr.com/ru/rss/articles/?fl=ru")
]);
if (r1.body == null || r2.body == null) throw new Error();

const container = /**@type { HTMLElement } */(document.getElementById("builtin-body"));
const template = document.createElement("template");
const buffer = document.createDocumentFragment();

/**@param { XMLNode } node  */
function write(node) {
    const { children: { title: { text: title }, description: { text: description }, pubDate: { text: pubDate}, "dc:creator": { text: creator = ""} = {}, link: { text: link}} } = node;
    template.innerHTML = description;
    const img = template.content.querySelector("img");
    if (img == undefined) return;
    const { src } = img;
    template.innerHTML = `
        <builtin-card data-time="${new Date(pubDate).getTime()}">
            <span slot="header" style="font-size: 1.2em;">${creator}</span>
            <span slot="header" style="font-weight: 400;">${ fromNow(new Date(pubDate)) }</span>
            <builtin-thumbnail style="height: 15em;" src="${src}"></builtin-thumbnail>
            <a slot="footer" href="${link}">${title}</a>
        </builtin-card>
    `;
    buffer.append(template.content);
}
let i = 2;
function close() {
    if (--i > 0) return;
    const children = /**@type { HTMLElement[] } */(Array.from(buffer.children));
    children.sort((a, b) => Number.parseInt(b.dataset.time ?? __throw(new Error())) - Number.parseInt(a.dataset.time ?? __throw(new Error())));
    container.append(...children);
}

r1.body.pipeThrough(new TextDecoderStream("utf-8")).pipeThrough(new XMLSaxStream(["item"])).pipeTo(new WritableStream({ write, close }));
r2.body.pipeThrough(new TextDecoderStream("utf-8")).pipeThrough(new XMLSaxStream(["item"])).pipeTo(new WritableStream({ write, close }));

/**@returns { never } */
function __throw(err) { throw err }