import { request } from "./RPC/service.js";

/**@type { ServiceWorkerGlobalScope } */
const self = /**@type {*}*/ (globalThis.self);

/**
 * @param { FetchEvent } e 
 * @param { URLSearchParams } searchParams 
 */
export function loadCjsModule(e, searchParams){
    if (e.clientId === "") return void e.respondWith(new Response(null, { status: 422 }));
    const pkg = searchParams.get("pkg");
    const entry = searchParams.get("entry");
    if (entry == null || pkg == null) return void e.respondWith(new Response(null, { status: 422 }));

    e.respondWith(cjsModule(e.clientId, pkg, entry))
    return true
}

/**
 * @param { string } clientId 
 * @param {*} pkg 
 * @param { string } entry  
 * @returns { Promise<Response> }
 */
async function cjsModule(clientId, pkg, entry) {
    const sourceText = await request(clientId, ["prepareModuleWrapper", pkg, entry])
    return new Response(sourceText, {
        status: 200,
        headers: {"Content-Type": "text/javascript"}
    });
}