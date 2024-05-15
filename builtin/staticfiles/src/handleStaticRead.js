/**@import { IncomingMessage, ServerResponse } from "node:http" */
/**@import { ReadStream } from "node:fs" */
/**@import { MetaReadStream } from "./common.js" */

import { pipeline } from "node:stream";
import { createReadStream } from "node:fs"

import { MIME, onReadStreamError, onReadStreamOpen, readPipelineCallBack, RESPONSE } from "./common.js"

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