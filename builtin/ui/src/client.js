import "./components/ActionButton.js"
import "./components/App.js"
import "./components/SideBar.js"
import "./components/SideBarItem.js"
import "./components/SideBarList.js"
import "./components/FeedCard.js"
import "./components/Thumbnail.js"
import "./components/Card.js"

// import { client } from "@builtin/communication/client";

// client.request("echo", { text: "Hello, World!" }).then(console.log);


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