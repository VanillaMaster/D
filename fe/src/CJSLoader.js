/**
 * @param { Response } res 
 */
function toText(res) { return res.text(); }
/**
 * @param { Response } res 
 */
function toJson(res) { return res.json(); }

/**@type { Set<string> } */
const loadedPackages = new Set();
/**@type { Map<string, Module> } */
const modulesCache = new Map();
/**@type { Map<Module, CJSExecutor> } */
const executors = new Map();

/**
 * @param { string } pkg
 */
async function loadCjsPackage(pkg) {
    if (loadedPackages.has(pkg)) return;

    const url = new URL("/api/modules", document.location.origin);
    url.searchParams.append("name", pkg);
    const data = await fetch(url).then(toJson);

    const { files, dependencies, importmap } = data;

    for (let i = 0; i < files.length; i++) {
        ({ pathname: files[i] } = new URL(files[i], `${document.location.origin}/modules/${pkg}/`));
    }

    /**@type { Array<Promise<string>> } */
    const tasks = [];
    for (const file of files) tasks.push(fetch(file).then(toText));
    const filesText = await Promise.all(tasks);

    for (let i = 0; i < files.length; i++) {
        const filename = files[i], text = filesText[i];

        const module = new Module(filename, filename, text);
        modulesCache.set(filename, module);
    }

    for (const entrypoint in importmap) {
        const pathname = importmap[entrypoint];
        modulesCache.set(entrypoint, /**@type { Module } */ (modulesCache.get(pathname)));
    }

    loadedPackages.add(pkg);
}

/**
 * @param { string } pkg 
 * @param { string } entrypoint 
 */
export async function loadCjsModule(pkg, entrypoint) {
    await loadCjsPackage(pkg);

    const exports = globalRequire(entrypoint);
    /**@type { string[] } */
    const exportedNames = [];
    if (exports[Module.namedExport] === true) for (const name in exports) if (name !== "default") exportedNames.push(name);
    return exportedNames;
}

/**
 * @param { string } specifier 
 */
export function globalRequire(specifier) {
    // const module = modulesCache.get(specifier);
    // if (module == undefined) throw new Error();
    const module = resolveModule(specifier);
    if (module.loaded) return module.exports;
    const executor = executors.get(module);
    if (!executors.delete(module)) throw new Error();
    /**@type { NonNullable<typeof executor> }*/
    (executor)(module.exports, createLocalRequire(module), module, module.filename, module.dirname);
    module.loaded = true;
    return module.exports;
}

/**
 * @param { string } specifier 
 */
function resolveModule(specifier) {
    let module;
    if ((module = modulesCache.get(specifier)) !== undefined) return module;
    if ((module = modulesCache.get(`${specifier}.js`)) !== undefined) return module;
    if ((module = modulesCache.get(`${specifier}/index.js`)) !== undefined) return module;
    throw new Error();
}

/**
 * @param { Module } parent 
 * @returns { CJSRequire }
 */
function createLocalRequire(parent) {
    return function(specifier) {
        if (modulesCache.has(specifier)) return globalRequire(specifier);

        ({ pathname: specifier } = new URL(specifier, new URL(parent.filename, document.location.origin)));
        return globalRequire(specifier);
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
 * @param { Module } module
 * @param { string } __filename
 * @param { string } __dirname
 * @returns { void }
 */
class Module {
    /**
     * @readonly
     */
    static namedExport = Symbol("named export");
    /**
     * @private
     * @readonly
     * @type { string [] }
     */
    static args = ["exports", "require", "module", "__filename", "__dirname"]

    /**
     * @param { string } id 
     * @param { string } filename 
     * @param { string } text 
     */
    constructor(id, filename, text) {
        this.id = id;

        this.filename = filename;
        ({ pathname: this.dirname } = new URL(".", new URL(filename, document.location.origin)));

        const executor = /**@type { CJSExecutor } */(new Function(...Module.args, text));
        executors.set(this, executor);
    }
    
    /**
     * @type { boolean }
     */
    loaded = false;
    /**
     * @type { any }
     */
    exports = { [Module.namedExport]: true };

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