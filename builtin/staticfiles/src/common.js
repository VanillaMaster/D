/**@import { IncomingMessage, ServerResponse } from "node:http" */
/**@import { ReadStream, WriteStream } from "node:fs" */
import { internalServerError, notFound } from "@builtin/backend/helpers";

/**
 * @typedef { { [RESPONSE]: ServerResponse; [MIME]: string; } } MetaReadStream
 * @typedef { { [RESPONSE]: ServerResponse; } } MetaWriteStream
 */

export const MIME = Symbol("mime");
export const RESPONSE = Symbol("request");

/**
 * @param { NodeJS.ErrnoException | null } err 
 */
export function readPipelineCallBack(err) {
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
export function writePipelineCallBack(err) {
    if (err == null) return;
    switch (err.code) {
        //ignored errors
        default: return void console.warn(err.code)
    }
}

/**
 * @this { ReadStream & MetaReadStream }
 */
export function onReadStreamOpen() {
    const { [RESPONSE]: response, [MIME]: mime } = this;
    response.setHeader("Content-Type", mime);
    response.statusCode = 200;
}

/**
 * @this { WriteStream & MetaWriteStream }
 */
export function onWriteStreamOpen() {
    const { [RESPONSE]: response } = this;
    response.statusCode = 200;
}

/**
 * @param { NodeJS.ErrnoException } err 
 * @this { ReadStream & MetaReadStream }
 */
export function onReadStreamError(err) {
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
export function onWriteStreamError(err) {
    const { [RESPONSE]: response } = this;
    switch (err.code) {
        default: return void internalServerError(response);
    }
}

/**
 * @this { WriteStream & MetaWriteStream }
 */
export function onWriteStreamClose() {
    const { [RESPONSE]: response } = this;
    response.end();
}