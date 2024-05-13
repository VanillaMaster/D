import "./components/ActionButton.js"
import "./components/App.js"
import "./components/SideBar.js"
import "./components/SideBarItem.js"
import "./components/SideBarList.js"

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

import { parser as Parser } from "sax";
import { fetch as fetchProxt } from "@builtin/proxy/client"

(async function() {
    const parser = Parser(true);
    parser.onopentag = function(tag) {
        // console.log(tag);
        if (tag.name == "item") {

        }
    }
    const response = await fetchProxt("https://habr.com/ru/rss/articles/?fl=ru");
    if (response.body == null) throw new Error(); 
    const reader = response.body.pipeThrough(/*new DecompressionStream("gzip")).pipeThrough(*/new TextDecoderStream("utf-8")).pipeTo(new WritableStream({
        write(chunk) {
            // console.log(chunk);
            parser.write(chunk)
        }
    }))
})()
