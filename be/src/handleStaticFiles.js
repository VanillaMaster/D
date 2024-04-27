/**@import { IncomingMessage, ServerResponse } from "node:http" */
/**@import { FileHandle } from "node:fs/promises" */
/**@import { ReadStream } from "node:fs" */
import { open } from "node:fs/promises";
import { getMime } from "./mime.js";
import { extname, resolve } from "node:path"

/**@typedef { { [STREAM]?: ReadStream; [FILE]?: FileHandle | null; } } MetaResponse */

const STREAM = Symbol("stream");
const FILE = Symbol("file");

function __null() { return null; }
/**
 * @param { ServerResponse } res 
 */
function notFound(res) {
    res.statusCode = 404;
    res.end();
}

/**
 * @this { ServerResponse<IncomingMessage> & { [STREAM]: ReadStream; [FILE]: FileHandle; } }
 */
function onResponseClose() {
    const { [STREAM]: stream, [FILE]: file } = this;
    stream.close();
    file.close();
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse & MetaResponse } res
 * @param { { "*": string } } params
 * @param { string } root
 */
export async function handleStaticFiles(req, res, params, root) {
    const { "*": subpath } = params;
    const path = resolve(root, subpath);
    const file = (res[FILE] = await open(path, 'r').catch(__null));
    // const file = await open(path, 'r').catch(__null);
    if (res.closed) return void file?.close();
    if (file === null) return void notFound(res);
    res.setHeader("Content-Type", getMime(extname(path)));
    res.statusCode = 200;
    const stream = (res[STREAM] = file.createReadStream());
    // const stream = file.createReadStream();
    res.on("close", onResponseClose);
    stream.pipe(res);
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse & MetaResponse } res
 * @param { string } path
 */
export async function handleStaticFile(req, res, path) {
    const file = (res[FILE] = await open(path, 'r').catch(__null));
    // const file = await open(path, 'r').catch(__null);
    if (res.closed) return void file?.close();
    if (file === null) return void notFound(res);
    res.setHeader("Content-Type", getMime(extname(path)));
    res.statusCode = 200;
    const stream = (res[STREAM] = file.createReadStream());
    // const stream = file.createReadStream();
    res.on("close", onResponseClose);
    stream.pipe(res);
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse & MetaResponse } res
 * @param { string } path
 * @param { string } mime 
 */
export async function handleStaticResource(req, res, path, mime) {
    const file = (res[FILE] = await open(path, 'r').catch(__null));
    // const file = await open(path, 'r').catch(__null);
    if (res.closed) return void file?.close();
    if (file === null) return void notFound(res);
    res.setHeader("Content-Type", mime);
    res.statusCode = 200;
    const stream = (res[STREAM] = file.createReadStream());
    // const stream = file.createReadStream();
    res.on("close", onResponseClose);
    stream.pipe(res);
}