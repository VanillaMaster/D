import { open } from "node:fs/promises";
import { getMime } from "./mime.js";
import { getExt } from "./ext.js";

/**
 * @typedef { import("node:http").IncomingMessage } IncomingMessage
 * @typedef { import("node:http").ServerResponse } ServerResponse
 * @typedef { import("node:fs/promises").FileHandle } FileHandle;
 */
function __null() { return null; }
/**
 * @param { ServerResponse } res 
 */
function notFound(res) {
    res.statusCode = 404;
    res.end();
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 * @param { { "*": string } } params
 * @param { URL } root
 */
export async function handleStaticFiles(req, res, params, root) {
    const { "*": path } = params;
    const absolute = new URL(path, root);
    const file = await open(absolute, 'r').catch(__null);
    if (file === null) return void notFound(res);
    res.writeHead(200, { "Content-Type": getMime(getExt(absolute.pathname)) });
    const stream = file.createReadStream();
    stream.addListener("close", function() {
        file.close();
    });
    stream.pipe(res);

}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 * @param { URL } path
 */
export async function handleStaticFile(req, res, path) {
    const file = await open(path, 'r').catch(__null);
    if (file === null) return void notFound(res);
    res.writeHead(200, { "Content-Type": getMime(getExt(path.pathname)) });
    const stream = file.createReadStream();
    stream.addListener("close", function() {
        file.close();
    });
    stream.pipe(res);
}