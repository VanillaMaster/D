import "./RPC/service.js";

{
    /**@type { Record<string, string[]> } */
    const extensions = await fetch("/api/extensions?kind=client").then(res => res.json());

    await Promise.all(
        Object.keys(extensions).map(extension => import(`${extension}/client`))
    ).then(function() {
        console.log("extensions loaded")
    }).catch(function(e) {
        console.error(e);
    })
}