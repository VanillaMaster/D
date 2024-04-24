/**@import { IncomingMessage, ServerResponse } from "node:http" */
import { open } from "node:fs/promises";
import { getMime } from "./mime.js";
import { getExt } from "./ext.js";

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
    res.setHeader("Content-Type", getMime(getExt(absolute.pathname)));
    res.statusCode = 200;
    const stream = file.createReadStream({ autoClose: true });
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
    res.setHeader("Content-Type", getMime(getExt(path.pathname)));
    res.statusCode = 200;
    const stream = file.createReadStream({ autoClose: true });
    stream.pipe(res);
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 * @param { URL } path
 * @param { string } mime 
 */
export async function handleStaticResource(req, res, path, mime) {
    const file = await open(path, 'r').catch(__null);
    if (file === null) return void notFound(res);
    res.setHeader("Content-Type", mime);
    res.statusCode = 200;
    const stream = file.createReadStream({ autoClose: true });
    stream.pipe(res);
}