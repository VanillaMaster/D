/**@import { IncomingMessage, ServerResponse } from "node:http" */
/**@import { WriteStream } from "node:fs" */
/**@import { MetaWriteStream } from "./common.js" */

import { resolve } from "node:path"
import { pipeline } from "node:stream";
import { createWriteStream } from "node:fs"

import { onWriteStreamClose, onWriteStreamError, onWriteStreamOpen, RESPONSE, writePipelineCallBack } from "./common.js"

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