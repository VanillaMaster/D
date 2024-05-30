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

    const rtf = new Intl.RelativeTimeFormat();
    /**
     * 
     * @param { Date } date 
     */
    function fromNow(date) {
        const time = date.getTime() - Date.now();
        const absolute = Math.abs(time);
        if (absolute >= 31_536_000_000) return rtf.format(Math.trunc(time / 31_536_000_000), "year");
        if (absolute >= 2_592_000_000) return rtf.format(Math.trunc(time / 2_592_000_000), "month");
        if (absolute >= 604_800_000) return rtf.format(Math.trunc(time / 604_800_000), "week");
        if (absolute >= 86_400_000) return rtf.format(Math.trunc(time / 86_400_000), "day");
        if (absolute >= 3_600_000) return rtf.format(Math.trunc(time / 3_600_000), "hour");
        if (absolute >= 60_000) return rtf.format(Math.trunc(time / 60_000), "minute");
        return rtf.format(time, "second");
    }

    const response = await fetchProxy("https://habr.com/ru/rss/articles/?fl=ru");
    if (response.body == null) throw new Error(); 
    const container = /**@type { HTMLElement } */(document.getElementById("tmp-body"));
    const template = document.createElement("template");
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
                    <span slot="header" style="font-weight: 400;">${ fromNow(new Date(pubDate)) }</span>
                    <builtin-thumbnail style="height: 15em; border-radius: .5em; box-shadow: 0px 1px 2px 0px rgb(0 0 0 / 30%), 0px 1px 3px 1px rgb(0 0 0 / 15%);" src="${src}"></builtin-thumbnail>
                    <a slot="footer" href="${link}">${title}</a>
                </builtin-card>
            `;
            container.append(template.content);
            // else console.warn("no img");
        }
    }))
})()
