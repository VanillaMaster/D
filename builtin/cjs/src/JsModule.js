import { Module } from "./Module.js";

export const NAMED_EXPORT = Symbol("named export");
export const EXECUTOR = Symbol("executor");
/**@type { readonly string[] } */
const ARGS = ["exports", "require", "module", "__filename", "__dirname"];

/**
 * @callback CJSRequire
 * @param { string } specifier
 * @returns { any }
 *
 * @callback CJSExecutor
 * @param { Record<string, any> } exports
 * @param { CJSRequire } require
 * @param { JsModule } module
 * @param { string } __filename
 * @param { string } __dirname
 * @returns { void }
 */
export class JsModule extends Module {
    /**
     * @param { string } id
     * @param { string } filename
     * @param { string } text
     */
    constructor(id, filename, text) {
        super(id, filename, { [NAMED_EXPORT]: true });
        /**@type { CJSExecutor | null } */
        this[EXECUTOR] = /**@type { CJSExecutor } */ (new Function(...ARGS, text));
    }
}
