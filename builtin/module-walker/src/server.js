import { listModules } from "./listModules.js";
import { MODULES_FOLDER } from "@builtin/config/server";

/**@type { WeakRef<backend.ModulesState> } */
let ref = new WeakRef(await listModules(MODULES_FOLDER));
/**@type { null | Promise<backend.ModulesState> } */
let promise = null;
async function updateRef() {
    const state = await listModules(MODULES_FOLDER);
    promise = null;
    ref = new WeakRef(state);
    return state;
}
export async function modules() {
    return ref.deref() ?? (promise ??= updateRef());
}

export async function registry() {
    const { registry } = await modules();
    return registry
}

export async function extensions() {
    const { extensions } = await modules();
    return extensions
}