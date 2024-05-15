import { listModules } from "./listModules.js";
import { MODULES_FOLDER } from "@builtin/config/server";

/**@type { WeakRef<backend.ModulesState> | null } */
let ref = null;

async function updateRef() {
    console.log("updateRef call");
    const state = await listModules(MODULES_FOLDER);
    ref = new WeakRef(state);
    return state;
}

export async function modules() {
    if (ref) return ref.deref() ?? updateRef();
    return updateRef();
}

export async function registry() {
    const { registry } = await modules();
    return registry
}

export async function extensions() {
    const { extensions } = await modules();
    return extensions
}