/**@import { ServerResponse } from "node:http" */

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
 * @param { string } [msg] 
 */
export function internalServerError(res, msg) {
    res.statusCode = 500;
    if (msg !== undefined) res.statusMessage = msg;
    res.end();
}

/**
 * @param { ServerResponse } res 
 */
export function unprocessableEntity(res) {
   res.statusCode = 422;
   res.end();
}

/**@type { Record<string, string> } */
const MIME = {
    ".js":   "text/javascript",
    ".json": "application/json",

    ".html": "text/html",
    ".xml": "text/xml",

    ".png": "image/png",

    ".css": "text/css"
}

const DEFAULT = "application/octet-stream";

/**
 * @param { string } ext 
 */
export function getMime(ext) {
    return MIME[ext] ?? DEFAULT;
}