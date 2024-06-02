import { lstat, readdir, readFile, readlink } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { count } from "./utils/count.js";
import { matchPattern } from "./utils/matchPattern.js";
import { exportsResolve, getExports, getExportsType } from "./esmResolve.js";
import { IGNORED_EXTENSIONS, IGNORED_MODULES } from "@builtin/config/server";
/**@import { Dirent } from "node:fs" */

const EXTENSIONS = [".js", ".cjs", ".mjs", ".json"];

/**
 * @param { unknown } reason 
 * @returns { null }
 */
function __null(reason) {
    return null;
}
/**
 * @param { unknown } reason 
 * @returns { null }
 */
function __nullErr(reason) {
    console.error(reason);
    return null;
}

/**
 * Traverse and collect information about all modules
 * 
 * ```js
 * const info = await listModulesV2("./node_modules");
 * ```
 * 
 * @param { string } path Path to modules folder 
 * @returns { Promise<backend.ModulesState> } Collected information
 */
export async function listModulesV2(path) {
    /**@type { backend.ModulesState } */
    const state = {
        extensions: {},
        registry: {}
    }

    const elements = await readdir(path, {
        withFileTypes: true
    }).catch(__nullErr);
    if (elements == null) return state;
    
    /**@type { Array<Promise<void> | void> } */
    const tasks = [];
    for (const element of elements) tasks.push(processPackageEntry(element, "", state));
    while (tasks.length > 0) await tasks.pop();

    return state
}

/**
 * @param { Dirent } element 
 * @param { string } prefix 
 * @param { backend.ModulesState } out
 */
function processPackageEntry(element, prefix, out) {
    if (element.isDirectory()) return processPackageDirectory(resolve(element.parentPath, element.name), element.name, prefix, out);
    if (element.isSymbolicLink()) return processPackageSymbolicLink(element.parentPath, element.name, prefix, out);
}

/**
 * @param { string } path 
 * @param { string } name 
 * @param { string } prefix 
 * @param { backend.ModulesState } out
 * @returns { Promise<void> | void }
 */
function processPackageDirectory(path, name, prefix, out) {
    if (name[0] === "@") {
        if (prefix === "") return processNamespace(path, name, out);
    } else return processPackage(path, prefix + name, out);
}

/**
 * @param { string } parentPath
 * @param { string } linkName 
 * @param { string } prefix 
 * @param { backend.ModulesState } out
 */
async function processPackageSymbolicLink(parentPath, linkName, prefix, out) {
    const linkValue = await readlink(resolve(parentPath, linkName));
    const path = resolve(parentPath, linkValue);
    const stats = await lstat(path);
    if (stats.isDirectory()) return processPackageDirectory(path, linkName, prefix, out);
}

/**
 * @param { string } path
 * @param { string } name
 * @param { backend.ModulesState } out
 */
async function processPackage(path, name, out) {
    const buffer = await readFile(resolve(path, "package.json")).catch(__null);
    if (buffer == null) return;
    /**@type { Pjson } */
    let pjson
    try {
        pjson = JSON.parse(buffer);
    } catch (error) {
        return void console.error(error);
    }
    // if (name == "json-rpc-2.0") debugger;
    const {
        dependencies = {},
        exports: exportsField = `./${normalize(pjson.main ?? "index.js").replaceAll(sep, "/")}`,
        type = "commonjs",

        prefetch: prefetchPatterns = [],
        editable: editablePatterns = [],
        stylesheet: stylesheetPatterns = [],
        kind
    } = pjson;

    const exportType = getExportsType(exportsField);
    if (exportType == 2) return void console.error("invalid package exports");
    const exports = getExports(exportsField, exportType);

    for (let i = 0; i < prefetchPatterns.length; i++) prefetchPatterns[i] = `./${normalize(prefetchPatterns[i]).replaceAll(sep, "/")}`;
    for (let i = 0; i < editablePatterns.length; i++) editablePatterns[i] = `./${normalize(editablePatterns[i]).replaceAll(sep, "/")}`;
    for (let i = 0; i < stylesheetPatterns.length; i++) stylesheetPatterns[i] = `./${normalize(stylesheetPatterns[i]).replaceAll(sep, "/")}`;

    if (kind !== undefined) {
        if (IGNORED_EXTENSIONS.every(pattern => !matchPattern(pattern, name))) {
            out.extensions[name] = kind;
        }
    }

    if (IGNORED_MODULES.every(pattern => !matchPattern(pattern, name))) {
        const allFiles = await readdir(path, { recursive: true });
        
        /**@type { string[] } */
        const files = [];
        /**@type { string[] } */
        const prefetch = [];
        /**@type { string[] } */
        const editable = [];
        /**@type { string[] } */
        const stylesheet = [];
    
        for (const file of allFiles) {
            const path = `./${normalize(file).replaceAll(sep, "/")}`;
    
            if (EXTENSIONS.includes(extname(file))) files.push(path);
            if (prefetchPatterns.some(pattern => matchPattern(pattern, path))) prefetch.push(`/modules/${name}/${path}`);
            if (editablePatterns.some(pattern => matchPattern(pattern, path))) editable.push(`/modules/${name}/${path}`);
            if (stylesheetPatterns.some(pattern => matchPattern(pattern, path))) stylesheet.push(`/modules/${name}/${path}`);
        }
    
        /**@type { { [origin: string]: string[] } } */
        const patterns = {};
        for (const [origin, value] of /**@type { [key: keyof Pjson.SubpathExports, value: Pjson.SubpathExports[keyof Pjson.SubpathExports]][]} */ (Object.entries(exports))) {
            descent(value, (patterns[origin] = []))
        }
    
        const origins = collectOrigins(patterns, files);
    
        /**@type { Record<string, string> } */
        const doct = {};
    
        for (const origin of origins) {
            const resolved = exportsResolve(origin, exports, ["node", "import", "default"]);
            if (typeof resolved == "string" && files.includes(resolved)) {
                doct[origin] = resolved
            }
        }

        out.registry[name] = new ModuleRecord(
            origins,
            exports,
            Object.keys(dependencies),
            files,
            type,
            kind,
            prefetch,
            editable,
            stylesheet
        )
    }

}

class ModuleRecord {
    /**
     * @param { ArrayLike<string> | Iterable<string> } origins 
     * @param { Pjson.SubpathExports } exports 
     * @param { string[] } dependencies 
     * @param { string[] } files 
     * @param { Pjson.type } type 
     * @param { Pjson.kind } [kind] 
     * @param { Pjson.prefetch} [prefetch] 
     * @param { Pjson.editable } [editable] 
     * @param { Pjson.stylesheet } [stylesheet] 
     */
    constructor(origins, exports, dependencies, files, type, kind, prefetch, editable, stylesheet) {
        this.origins = Array.from(origins);
        this.exports = exports;
        this.dependencies = dependencies;
        this.files = files;
        this.type = type;
        if (kind !== undefined) this.kind = kind;
        if (prefetch !== undefined && prefetch.length > 0) this.prefetch = prefetch;
        if (editable !== undefined && editable.length > 0) this.editable = editable;
        if (stylesheet !== undefined && stylesheet.length > 0) this.stylesheet = stylesheet;

    }

    /**
     * @readonly
     * @type { string[] }
     */
    origins;

    /**
     * @readonly
     * @type { Pjson.SubpathExports }
     */
    exports;

    /**
     * @readonly
     * @type { string[] }
     */
    dependencies;

    /**
     * @readonly
     * @type { string[] }
     */
    files;

    /**
     * @readonly
     * @type { Pjson.type }
     */
    type;

    /**
     * @readonly
     * @type { Pjson.kind | undefined }
     */
    kind;

    /**
     * @readonly
     * @type { Pjson.prefetch | undefined }
     */
    prefetch;

    /**
     * @readonly
     * @type { Pjson.editable | undefined }
     */
    editable;

    /**
     * @readonly
     * @type { Pjson.stylesheet | undefined }
     */
    stylesheet;
}

/**
 * @param { string } path
 * @param { string } name
 * @param { backend.ModulesState } out
 */
async function processNamespace(path, name, out) {
    const elements = await readdir(path, { withFileTypes: true }).catch(__nullErr);
    if (elements == null) return;
    /**@type { Array<Promise<void> | void> } */
    const tasks = [];
    for (const element of elements) tasks.push(processPackageEntry(element, name + "/", out));
    while (tasks.length > 0) await tasks.pop();
}


/**
 * @param { Exclude<Pjson.exports, Pjson.SubpathExports> } exports
 * @param { string[] } out 
 */
function descent(exports, out) {
    if (typeof exports == "string") {
        out.push(exports);
    } else if (exports == null) {
        
    } else if (Array.isArray(exports)) {
        for (const entry of exports) descent(entry, out);
    } else {
        for (const entry of Object.values(exports)) descent(entry, out);
    }
}

/**
 * @param { { [origin: string]: string[] } } patterns 
 * @param { string[] } files 
 */
function collectOrigins(patterns, files) {
    /**@type { Set<string> } */
    const origins = new Set();
    for (const origin in patterns) {
        for (const destination of patterns[origin]) {
            const o = count(origin, "*"), d = count(destination, "*");
            if (o !== d) {
                console.warn(origin, destination);
                continue;
            }
            switch (o + d) {
                case 0: origins.add(origin); break;
                case 2: {
                    const [oLHS, oRHS] = origin.split("*");
                    const [dLHS, dRHS] = destination.split("*");
                    for (const file of files) if (file.startsWith(dLHS) && file.endsWith(dRHS)) {
                        const substitutions = file.substring(dLHS.length, file.length - dRHS.length);
                        const key = `./${join(oLHS, substitutions, oRHS).replaceAll(sep, "/")}`;
                        origins.add(key);
                    }
                } break;
                default: console.warn(origin, destination); break;
            }
        }
    }
    return origins;
}