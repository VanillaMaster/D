import { Module } from "./Module.js";

export class JsonModule extends Module {
    /**
     * @param { string } id
     * @param { string } filename
     * @param { any } data
     */
    constructor(id, filename, data) {
        super(id, filename, data);
    }
}
