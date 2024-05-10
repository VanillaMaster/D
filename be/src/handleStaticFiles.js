/**@import { IncomingMessage, ServerResponse } from "node:http" */
/**@import { ReadStream, WriteStream } from "node:fs" */
import { getMime } from "./mime.js";
import { extname, resolve } from "node:path"
import { pipeline } from "node:stream";
import { createReadStream, createWriteStream } from "node:fs"

/**
 * @typedef { { [RESPONSE]: ServerResponse; [MIME]: string; } } MetaReadStream
 * @typedef { { [RESPONSE]: ServerResponse; } } MetaWriteStream
 */
const MIME = Symbol("mime");
const RESPONSE = Symbol("request");

/**
 * @param { ServerResponse } res 
 */
export function notFound(res) {
    res.statusCode = 404;
    res.end();
}
/**
 * @param { ServerResponse } res 
 */
export function notAllowed(res) {
    res.statusCode = 405;
    res.end();
}
/**
 * @param { ServerResponse } res 
 */
export function internalServerError(res) {
    res.statusCode = 500;
    res.end();
}

/**
 * @param { NodeJS.ErrnoException | null } err 
 */
function readPipelineCallBack(err) {
    if (err == null) return;
    switch (err.code) {
        //ignored errors
        case "ENOENT":
        case "ERR_STREAM_PREMATURE_CLOSE": return;
        default: return void console.warn(err.code)
    }
}
/**
 * @param { NodeJS.ErrnoException | null } err 
 */
function writePipelineCallBack(err) {
    if (err == null) return;
    switch (err.code) {
        //ignored errors
        default: return void console.warn(err.code)
    }
}

/**
 * @this { ReadStream & MetaReadStream }
 */
function onReadStreamOpen() {
    const { [RESPONSE]: response, [MIME]: mime } = this;
    response.setHeader("Content-Type", mime);
    response.statusCode = 200;
}

/**
 * @this { WriteStream & MetaWriteStream }
 */
function onWriteStreamOpen() {
    const { [RESPONSE]: response } = this;
    response.statusCode = 200;
}

/**
 * @param { NodeJS.ErrnoException } err 
 * @this { ReadStream & MetaReadStream }
 */
function onReadStreamError(err) {
    const { [RESPONSE]: response } = this;
    switch (err.code) {
        case "ENOENT": return void notFound(response);
        default: return void internalServerError(response);
    }
}

/**
 * @param { NodeJS.ErrnoException } err 
 * @this { WriteStream & MetaWriteStream }
 */
function onWriteStreamError(err) {
    const { [RESPONSE]: response } = this;
    switch (err.code) {
        default: return void internalServerError(response);
    }
}

/**
 * @this { WriteStream & MetaWriteStream }
 */
function onWriteStreamClose() {
    const { [RESPONSE]: response } = this;
    response.end();
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 * @param { { "*": string } } params
 * @param { string } root
 */
export function handleParametricFileRead(req, res, params, root) {
    const { "*": subpath } = params;
    const path = resolve(root, subpath);
    /**@type { ReadStream & Partial<MetaReadStream> } */
    const stream = createReadStream(path);
    stream[RESPONSE] = res;
    stream[MIME] = getMime(extname(path));
    stream.on("open", onReadStreamOpen);
    stream.on("error", onReadStreamError);
    pipeline(stream, res, readPipelineCallBack);
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 * @param { string } path
 */
export function handleStaticFileRead(req, res, path) {
    /**@type { ReadStream & Partial<MetaReadStream> } */
    const stream = createReadStream(path);
    stream[RESPONSE] = res;
    stream[MIME] = getMime(extname(path));
    stream.on("open", onReadStreamOpen);
    stream.on("error", onReadStreamError);
    pipeline(stream, res, readPipelineCallBack);
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 * @param { string } path
 * @param { string } mime 
 */
export function handleStaticRead(req, res, path, mime) {
    /**@type { ReadStream & Partial<MetaReadStream> } */
    const stream = createReadStream(path);
    stream[RESPONSE] = res;
    stream[MIME] = mime;
    stream.on("open", onReadStreamOpen);
    stream.on("error", onReadStreamError);
    pipeline(stream, res, readPipelineCallBack);
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 * @param { { "*": string } } params
 * @param { string } root
 */
export function handleParametricResourceWrite(req, res, params, root) {
    const { "*": subpath } = params;
    const path = resolve(root, subpath);
    /**@type { WriteStream & Partial<MetaWriteStream> } */
    const stream = createWriteStream(path);
    stream[RESPONSE] = res;
    stream.on("open", onWriteStreamOpen);
    stream.on("error", onWriteStreamError);
    stream.on("close", onWriteStreamClose);
    pipeline(req, stream, writePipelineCallBack);
}