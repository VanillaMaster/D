/**
 * @param { Response } res 
 */
function toJson(res) { return res.json(); }

/**
 * @param { Error } error 
 * @returns { never }
 */
function __throw(error) {
    throw error;
}

/**@type { Set<string> } */
const loadedPackages = new Set();
/**@type { Map<string, Module> } */
const packagesCache = new Map();
/**@type { Map<string, Module> } */
const modulesCache = new Map();
/**@type { Map<JsModule, CJSExecutor> } */
const executors = new Map();

/**
 * @param { string } pkg
 */
export async function preloadCjsPackage(pkg) {
    if (loadedPackages.has(pkg)) return;

    const url = new URL("/api/modules", document.location.origin);
    url.searchParams.append("name", pkg);
    const data = await fetch(url).then(toJson);

    /**@type { { files: string[], dependencies: string[], importmap: Record<string, string> } } */
    const { files, dependencies, importmap } = data;

    // const dependenciesPromise = Promise.all(dependencies.map(__import));

    for (let i = 0; i < files.length; i++) {
        ({ pathname: files[i] } = new URL(files[i], `${document.location.origin}/modules/${pkg}/`));
    }

    await Promise.all(files.map(fetchModule));

    for (const specifier in importmap) {
        const pathname = importmap[specifier];
        packagesCache.set(specifier, /**@type { Module } */ (modulesCache.get(pathname)));
    }

    loadedPackages.add(pkg);
    // await dependenciesPromise;
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
            return fetchJsModule(file, response);
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
function getPackageName(specifier) {
    const i = specifier.indexOf("/");
    if (i == -1) return specifier;
    return specifier.substring(0, i);
}
/**
 * @param { string } specifier 
 */
export async function listExportedNames(specifier) {
    const pkg = getPackageName(specifier);
    await preloadCjsPackage(pkg);

    const exports = globalRequire(specifier);
    /**@type { string[] } */
    const exportedNames = [];
    if (exports[JsModule.namedExport] === true) for (const name in exports) if (name !== "default") exportedNames.push(name);
    return exportedNames;
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
    if (module.loaded) return module.exports;
    const executor = executors.get(module);
    if (!executors.delete(module)) throw new Error("Unavailable");
    /**@type { NonNullable<typeof executor> }*/
    (executor)(module.exports, createLocalRequire(module), module, module.filename, module.dirname);
    module.loaded = true;
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
class Module {
    /**
     * @param { string } id 
     * @param { string } filename 
     * @param { any } exports 
     */
    constructor(id, filename, exports) {
        this.id = id;
        this.filename = filename;
        this.exports = exports;
        ({ pathname: this.dirname } = new URL(".", new URL(filename, document.location.origin)));
    }
    /**
     * @type { any }
     */
    exports;
    /**
     * @readonly
     * @type { string }
     */
    filename;
    /**
     * @readonly
     * @type { string }
     */
    dirname;
    /**
     * @readonly
     * @type { string }
     */
    id;
}
class JsModule extends Module {
    /**
     * @readonly
     */
    static namedExport = Symbol("named export");
    /**
     * @private
     * @readonly
     * @type { readonly string[] }
     */
    static args = ["exports", "require", "module", "__filename", "__dirname"]
    /**
     * @param { string } id 
     * @param { string } filename 
     * @param { string } text 
     */
    constructor(id, filename, text) {
        super(id, filename, { [JsModule.namedExport]: true });
        const executor = /**@type { CJSExecutor } */(new Function(...JsModule.args, text));
        executors.set(this, executor);
    }
    /**
     * @type { boolean }
     */
    loaded = false;
}

class JsonModule extends Module {
    /**
     * @param { string } id 
     * @param { string } filename 
     * @param { any } data 
     */
    constructor(id, filename, data) {
        super(id, filename, data);
    }
}