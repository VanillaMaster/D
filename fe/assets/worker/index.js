import { loadCjsModule } from "./CJSModules.js";
import "./RPC/service.js";

/**@type { ServiceWorkerGlobalScope } */
const self = /**@type {*}*/ (globalThis.self);


self.addEventListener("fetch", function(e){
    const { searchParams } = new URL(e.request.url);
    const mode = searchParams.get("sw");
    if (mode == "intercept") return void intercept(e, searchParams);

})

/**
 * @param { FetchEvent } e 
 * @param { URLSearchParams } searchParams 
 */
function intercept(e, searchParams) {
    const type = searchParams.get("type");
    if (type == "cjs") return void loadCjsModule(e, searchParams);
}

self.addEventListener('install', (event) => {
    // setTimeout(self.skipWaiting, 1000);
    self.skipWaiting()
});

self.addEventListener('activate', (event) => {
    // console.log('activate');
});