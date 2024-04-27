/**@import { IncomingMessage, ServerResponse } from "node:http" */
import { JSONRPCServer } from "json-rpc-2.0"

export const server = new JSONRPCServer();

/**
 * @param { ServerResponse } res 
 */
function unprocessableEntity(res) {
    res.statusCode = 422;
    res.end();
}

/**
 * @param { IncomingMessage } req
 * @param { ServerResponse } res
 */
export function handleRPC(req, res) {
    const { "content-length": rawLength, "content-type": mime } = req.headers;
    const length = Number(rawLength);

    if (Number.isNaN(length)) return void unprocessableEntity(res);
    if (mime !== "application/json") return void unprocessableEntity(res);

    let offset = 0;
    const buffer = Buffer.alloc(length);

    req.on("data", /**@param { Uint8Array } data*/function(data) {
        buffer.set(data, offset);
        offset += data.byteLength;
    })
    req.on("end", async function() {
        const body = parseSafe(buffer);
        if (body === undefined) {
            req.statusCode = 422;
            return void res.end();
        }
        const jsonRPCResponse = await server.receive(body);
        if (jsonRPCResponse) {
            res.setHeader("Content-Type", "application/json");
            res.statusCode = 200;
            res.end(JSON.stringify(jsonRPCResponse));
        } else {
            res.statusCode = 204;
            res.end();
        }
    })
}

/**
 * @param { any } data 
 */
function parseSafe(data) {
    try {
        return JSON.parse(data);
    } catch (e) {
        return undefined
    }
}