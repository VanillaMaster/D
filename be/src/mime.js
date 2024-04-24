/**@type { Record<string, string> } */
const MIME = {
    "js":   "text/javascript",
    "json": "application/json",

    "html": "text/html",

    "png": "image/png"
}

const DEFAULT = "application/octet-stream";

/**
 * @param { string } ext 
 */
export function getMime(ext) {
    return MIME[ext] ?? DEFAULT;
}