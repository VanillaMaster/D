import { JsModule, EXECUTOR, NAMED_EXPORT } from "./JsModule.js";
import { JsonModule } from "./JsonModule.js";
import { loadedPackages, pendingPackages, modulesCache, packagesCache} from "./cache.js"
import { join } from "./path.js";
/**@import { Module } from "./Module.js" */
/**@import { CJSRequire, CJSExecutor } from "./JsModule.js" */

/**
 * @param { Response } res 
 */
function toJson(res) { return res.json(); }
/**
 * @param { Error } error 
 * @returns { never }
 */
function __throw(error) { throw error; }

/**
 * @param { string } pkg
 */
async function preloadCjsPackage(pkg) {
    const url = new URL("/api/modules", document.location.origin);
    url.searchParams.append("name", pkg);
    /**@type { ModuleRecord } */
    const data = await fetch(url).then(toJson);

    const { files, dependencies, exports } = data;
    for (let i = 0; i < files.length; i++) {
        files[i] = join("/modules", pkg, files[i]);
    }

    await Promise.all(files.map(fetchModule));

    for (const entry in exports) {
        const specifier = join(pkg, entry)
        const pathname = join("/modules", pkg, exports[entry]);
        packagesCache.set(specifier, /**@type { Module } */ (modulesCache.get(pathname)));
    }
}

/**
 * @param { string } pkg
 * @returns { Promise<void> }
 */
function preloadCjsPackage$1(pkg) {
    if (loadedPackages.has(pkg)) return Promise.resolve();
    const pending = pendingPackages.get(pkg);
    if (pending !== undefined) return pending;
    const promise = preloadCjsPackage$2(pkg);
    pendingPackages.set(pkg, promise);
    return promise;
}
/**
 * @param { string } pkg
 */
async function preloadCjsPackage$2(pkg) {
    await preloadCjsPackage(pkg);
    loadedPackages.add(pkg);
    pendingPackages.delete(pkg);
}

export { preloadCjsPackage$1 as preloadCjsPackage }

/**
 * @param { string } file
 * @returns { Promise<Module> }
 */
async function fetchModule(file) {
    const response = await fetch(file);
    const mime = response.headers.get("Content-Type");
    switch (mime) {
        case "text/javascript":
        case "application/javascript":
            return fetchJsModule(file, response);
        case "text/json":
        case "application/json":
            return fetchJsonModule(file, response);
        default:
            throw new Error(`unexpected mime type (${mime})`);
    }
}

/**
 * @param { string } filename 
 * @param { Response } response 
 */
async function fetchJsModule(filename, response) {
    const text = await response.text();
    const module = new JsModule(filename, filename, text);
    modulesCache.set(filename, module);
    return module;
}

/**
 * @param { string } filename 
 * @param { Response } response 
 */
async function fetchJsonModule(filename, response) {
    const data = await response.json();
    const module = new JsonModule(filename, filename, data);
    modulesCache.set(filename, module);
    return module;
}

/**
 * @param { string } specifier 
 */
export function globalRequire(specifier) {
    const module = packagesCache.get(specifier);
    if (module === undefined) return undefined;
    return exportModule(module);
}

/**
 * @param { string } specifier 
 */
export function absoluteRequire(specifier) {
    const module = resolveModule(specifier);
    if (module === undefined) return undefined;
    return exportModule(module);
}

/**
 * @param { string } specifier 
 * @param { Module } parent 
 */
export function relativeRequire(specifier, parent) {
    ({ pathname: specifier } = new URL(specifier, new URL(parent.filename, document.location.origin)));
    return absoluteRequire(specifier);
}

/**
 * @param { Module } module 
 */
function exportModule(module) {
    switch (module.constructor) {
        case JsModule:
            return exportJsModule(/**@type { JsModule }*/(module))
        case JsonModule:
            return exportJsonModule(/**@type { JsonModule }*/(module))
        default:
            throw new Error("Unavailable");
    }
}

/**
 * @param { JsModule } module 
 */
function exportJsModule(module) {
    const executor = module[EXECUTOR];
    if (executor == null) return module.exports;
    module[EXECUTOR] = null;
    executor(module.exports, createLocalRequire(module), module, module.filename, module.dirname);
    return module.exports;
}
/**
 * @param { JsonModule } module 
 */
function exportJsonModule(module) {
    return module.exports;
}

/**
 * @param { string } specifier 
 */
function resolveModule(specifier) {
    /**@type { Module | undefined } */
    let module;
    if ((module = modulesCache.get(`${specifier}`)) !== undefined) return module;
    if ((module = modulesCache.get(`${specifier}.js`)) !== undefined) return module;
    if ((module = modulesCache.get(`${specifier}.json`)) !== undefined) return module;
    if ((module = modulesCache.get(`${specifier}/index.js`)) !== undefined) return module;
    if ((module = modulesCache.get(`${specifier}/index.json`)) !== undefined) return module;
}

/**
 * @param { Module } parent 
 * @returns { CJSRequire }
 */
function createLocalRequire(parent) {
    return function(specifier) {
        return globalRequire(specifier) ?? relativeRequire(specifier, parent) ?? __throw(new Error(`Cannot find module '${specifier}'`));
    }
}

/**
 * @param { string } pkg 
 * @param { string } entry 
 */
export async function prepareModuleWrapper(pkg, entry) {
    await preloadCjsPackage$1(pkg);

    const exports = globalRequire(pkg);
    /**@type { string[] } */
    const exportedNames = [];
    if (exports[NAMED_EXPORT] === true) for (const name in exports) if (name !== "default") exportedNames.push(name);
    const specifier = join(pkg, entry)
    return constructModuleWrapper(specifier, exportedNames);
}

/**
 * @param { string } specifier 
 * @param { string[] } exportedNames 
 */
function constructModuleWrapper(specifier, exportedNames) {
    /**@type { string[] } */
    const buffer = [
        `import { globalRequire } from "@builtin/cjs/client";`,
        `const module = globalRequire(${JSON.stringify(specifier)});`,
        `export default module;`
    ];
    if (exportedNames.length > 0) {
        buffer.push(`export const {`);
        buffer.push(exportedNames.map(name => `    ${name}`).join(",\n"))
        buffer.push(`} = module;`)
    }
    return buffer.join("\n");
}