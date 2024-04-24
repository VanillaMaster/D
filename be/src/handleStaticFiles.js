/**@import { IncomingMessage, ServerResponse } from "node:http" */
import { open } from "node:fs/promises";
import { getMime } from "./mime.js";
import { extname, resolve } from "node:path"

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
 * @param { string } root
 */
export async function handleStaticFiles(req, res, params, root) {
    const { "*": subpath } = params;
    const path = resolve(root, subpath);
    const file = await open(path, 'r').catch(__null);
    if (file === null) return void notFound(res);
    res.setHeader("Content-Type", getMime(extname(path)));
    res.statusCode = 200;
    const stream = file.createReadStream({ autoClose: true });
    stream.pipe(res);

}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 * @param { string } path
 */
export async function handleStaticFile(req, res, path) {
    const file = await open(path, 'r').catch(__null);
    if (file === null) return void notFound(res);
    res.setHeader("Content-Type", getMime(extname(path)));
    res.statusCode = 200;
    const stream = file.createReadStream({ autoClose: true });
    stream.pipe(res);
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 * @param { string } path
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