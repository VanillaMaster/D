/**@import { IncomingMessage, ServerResponse } from "node:http" */
/**@import { ReadStream } from "node:fs" */
/**@import { MetaReadStream } from "./common.js" */

import { extname } from "node:path"
import { pipeline } from "node:stream";
import { createReadStream } from "node:fs"

import { MIME, onReadStreamError, onReadStreamOpen, readPipelineCallBack, RESPONSE } from "./common.js"
import { getMime } from "@builtin/backend/helpers";

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