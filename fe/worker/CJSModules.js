import { request } from "./RPC/service.js";

/**@type { ServiceWorkerGlobalScope } */
const self = /**@type {*}*/ (globalThis.self);

/**
 * @param { FetchEvent } e 
 * @param { URLSearchParams } searchParams 
 */
export function loadCjsModule(e, searchParams){
    if (e.clientId === "") return void e.respondWith(new Response(null, { status: 422 }));
    const entrypoint = searchParams.get("specifier");
    if (entrypoint == null) return void e.respondWith(new Response(null, { status: 422 }));

    e.respondWith(cjsModule(e.clientId, entrypoint))
    return true
}

/**
 * @param { string } clientId 
 * @param { string } entrypoint  
 * @returns { Promise<Response> }
 */
async function cjsModule(clientId, entrypoint) {
    const names = await request(clientId, ["listExportedNames", entrypoint])
    return new Response(constructModule(entrypoint, names), {
        status: 200,
        headers: {"Content-Type": "text/javascript"}
    });
}

/**
 * @param { string } entrypoint 
 * @param { string[] } exportedNames 
 */
function constructModule(entrypoint, exportedNames) {
    /**@type { string[] } */
    const buffer = [
        `import { globalRequire} from "@builtin/cjs/client";`,
        `const module = globalRequire(${JSON.stringify(entrypoint)});`,
        `export default module;`
    ];
    if (exportedNames.length > 0) {
        buffer.push(`export const {`);
        buffer.push(exportedNames.map(name => `    ${name}`).join(",\n"))
        buffer.push(`} = module;`)
    }
    return buffer.join("\n");
}