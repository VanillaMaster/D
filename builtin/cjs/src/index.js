import { JsModule, EXECUTOR, NAMED_EXPORT } from "./JsModule.js";
import { JsonModule } from "./JsonModule.js";
import { loadedPackages, pendingPackages, modulesCache, packagesCache} from "./cache.js"
import { join } from "./path.js";
import { exportsResolvePackage } from "@builtin/module-walker/esm"
/**@import { Module } from "./Module.js" */
/**@import { CJSRequire } from "./JsModule.js" */

/**@type { readonly string[] } */
const CJS_CONDITIONS = ["require", "default"];

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
async function preloadCjsPackageUnsafe(pkg) {
    const url = new URL("/api/modules", document.location.origin);
    url.searchParams.append("name", pkg);
    /**@type { backend.ModuleRecord } */
    const data = await fetch(url).then(toJson);

    const { files, dependencies } = data;
    const exports = exportsResolvePackage(data, CJS_CONDITIONS)
    for (let i = 0; i < files.length; i++) {
        files[i] = join("/modules", pkg, files[i]);
    }

    await Promise.all(files.map(fetchModule));
    
    for (const entry in exports) {
        const specifier = join(pkg, entry)
        const pathname = join("/modules", pkg, exports[entry]);
        const module = resolveModule(pathname);
        if (module == undefined) throw new Error();
        packagesCache.set(specifier, module);
    }
}

/**
 * Asynchronously preload cjs pacjage by specified package name
 * 
 * Used in pair with `require` function to avoid synchronous loading
 * ```js
 * await preloadCjsPackage("some-package")
 * const packageExports = globalRequire("some-package");
 * ```
 * @param { string } pkg String that specifies package name
 * @returns { Promise<void> } A Promise for the completion of preloading
 */
export function preloadCjsPackage(pkg) {
    if (loadedPackages.has(pkg)) return Promise.resolve();
    const pending = pendingPackages.get(pkg);
    if (pending !== undefined) return pending;
    const promise = preloadCjsPackageUnsafe(pkg).finally(function() {
        loadedPackages.add(pkg);
        pendingPackages.delete(pkg);
    })
    pendingPackages.set(pkg, promise);
    return promise;
}

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
 * Function implementing cjs `require`
 * with ability to resolve only `bare` specifier
 * 
 * Does not cause synchronous loading,
 * becaus can access only modules from cache,
 * so must be used with `preloadCjsPackage`
 * 
 * ```js
 * await preloadCjsPackage("some-package")
 * const somePackage = globalRequire("some-package");
 * const somePackageShuffle = globalRequire("some-package/shuffle")
 * ```
 * 
 * @param { string } specifier Package name, or a specific feature module within a package prefixed by the package name
 * @returns { any } Exported module content
 */
export function globalRequire(specifier) {
    const module = packagesCache.get(specifier);
    if (module === undefined) return undefined;
    return exportModule(module);
}

/**
 * Function implementing cjs `require`
 * with ability to resolve only `absolute` specifier
 * 
 * Does not cause synchronous loading,
 * becaus can access only modules from cache,
 * so must be used with `preloadCjsPackage`
 * 
 * ```js
 * //some-package located at /home/user/bin/
 * await preloadCjsPackage("some-package")
 * const scriptExports = absoluteRequire("/home/user/bin/some-package/src/script.js");
 * ```
 * 
 * @param { string } specifier Absolute path to required module 
 * @returns { any } Exported module content
 */
export function absoluteRequire(specifier) {
    const module = resolveModule(specifier);
    if (module === undefined) return undefined;
    return exportModule(module);
}

/**
 * function implementing cjs `require`
 * with ability to resolve only `relative` specifier
 * 
 * does not cause synchronous loading,
 * becaus can access only modules from cache,
 * so must be used with `preloadCjsPackage`
 * 
 * ```js
 * await preloadCjsPackage("package")
 * const packageExports = relativeRequire("package");
 * ```
 * 
 * @param { string } specifier Relative path to required module 
 * @param { string } parent Path, that specifier will be resolved against
 */
export function relativeRequire(specifier, parent) {
    ({ pathname: specifier } = new URL(specifier, new URL(parent, document.location.origin)));
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
    executor(module.exports, createRequire(module.filename), module, module.filename, module.dirname);
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
 * factory for creating cjs `require` functions
 * 
 * ```js
 * const require = createRequire(import.meta.url);
 * // sibling-module.js is a CommonJS module.
 * const siblingModule = require('./sibling-module'); 
 * ```
 * @param { string } parent A path to be used to construct the `require` function.
 * @returns { CJSRequire } Require function
 */
export function createRequire(parent) {
    return function(specifier) {
        return globalRequire(specifier) ?? relativeRequire(specifier, parent) ?? __throw(new Error(`Cannot find module '${specifier}'`));
    }
}

/**
 * Prefetching cjs module, executes it, and then return esm weapper
 * 
 * ```js
 * const ESMWrapper = await prepareModuleWrapper("some-package")
 * ```
 * 
 * `some-package` source text:
 * ```js
 * exports.answer = 42;
 * ```
 * 
 * constructed wrapper:
 * ```js
 * import { globalRequire } from "@builtin/cjs/frontend";
 * const module = globalRequire("some-package");
 * export default module;
 * export const {
 *     answer
 * } = module;
 * ```
 * 
 * @param { string } pkg String that specifies package name
 * @param { string } [entry] Subpath to specific feature module within a package
 * @returns { Promise<string> } Text of ESM wrapper
 */
export async function prepareModuleWrapper(pkg, entry = ".") {
    await preloadCjsPackage(pkg);

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