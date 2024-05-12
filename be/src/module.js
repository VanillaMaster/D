import { lstat, readFile, readdir, readlink } from "node:fs/promises";
import { resolve, parse, dirname, extname, sep, normalize, join } from "node:path"
import { fileURLToPath } from "node:url"
import { Dirent, existsSync } from "node:fs";
import { ignoredModules } from "./config.js";

/**
 * @typedef ModuleRecord
 * @property { "commonjs" | "module" } type
 * @property { Record<string, pjsonExportRecord> } exports
 * @property { string[] } dependencies
 * @property { string[] } files
 * @property { Record<string, string> } importmap
 * @property { string[] } [kind]
 * @property { string[] } [prefetch]
 * @property { string[] } [editable]
 * @property { string[] } [stylesheet]
 * 
 * @typedef { Record<string, ModuleRecord>} Registry
 * 
 * @typedef { "commonjs" | "module" } packageType
 * 
 * @typedef pjsonExportRecord
 * @property { string } [import]
 * @property { string } [require]
 * @property { string } [default]
 * 
 * @typedef pjson
 * @property { string } name
 * @property { Record<string, string> } dependencies
 * @property { string } [main]
 * @property { packageType } [type]
 * @property { Record<string, string | null | pjsonExportRecord> } [exports]
 * @property { string[] } [kind]
 * @property { string[] } [prefetch]
 * @property { string[] } [editable]
 * @property { string[] } [stylesheet]
 */

/**
 * @param { string } self 
 * @param { string } searchString 
 * @param { number } [position] 
 */
function count(self, searchString, position = 0) {
    if (searchString == "") return Infinity;
    let i = 0;
    while ((position = self.indexOf(searchString, position)) !== -1) {
        position += searchString.length;
        i++;
    }
    return i;
}

/**
 * @param { any } err 
 * @returns { never }
 */
function __throw(err) {
    throw err;
}
/**
 * @param { string } path 
 */
function* paths(path) {
    const { root } = parse(path);
    do {
        yield (path = dirname(path));
    } while (path !== root);
}

/**
 * @param { string | URL } entry
 */
export function getModuleRoot(entry) {
    const path = fileURLToPath(entry)
    for (const root of paths(path)) {
        const pjson = resolve(root, "package.json")
        if (existsSync(pjson)) return root;
    }
    throw new Error();
}


/**
 * @returns { never[] }
 */
function __array() { return []; }
function __null() { return null; }

/**
 * @param { Record<string, ModuleRecord> } modules 
 */
export function computeImportMap(modules) {
    const importmap = {
        /**@type { Record<string, string> } */
        imports: {}
    }
    for (const module in modules) {
        const record = modules[module];
        if (record.type == "commonjs") for (const key in record.importmap) {
            const value = record.importmap[key];
            const params = new URLSearchParams();
            params.append("sw", "intercept");
            params.append("type", "cjs");
            params.append("specifier", key);
            importmap.imports[key] = `${value}?${params}`;
        } else Object.assign(importmap.imports, record.importmap);
    }
    return importmap;
}

/**
 * @param { Record<string, ModuleRecord> } modules 
 */
export function computeEditableList(modules) {
    /**@type { string[] } */
    const editable = [];
    for (const module in modules) {
        const { editable: localEditable } = modules[module];
        if (localEditable !== undefined) editable.push(...localEditable);
    }
    return editable;
}

/**
 * @param { Record<string, ModuleRecord> } modules 
 */
export function computeStylesheetList(modules) {
    /**@type { string[] } */
    const stylesheet = [];
    for (const module in modules) {
        const { stylesheet: localStylesheet } = modules[module];
        if (localStylesheet !== undefined) stylesheet.push(...localStylesheet);
    }
    return stylesheet;
}

/**
 * @param { Record<string, ModuleRecord> } modules 
 */
export function computePrefetchList(modules) {
    /**@type { string[] } */
    const prefetch = [];
    for (const module in modules) {
        const { prefetch: localPrefetch } = modules[module];
        if (localPrefetch !== undefined) prefetch.push(...localPrefetch);
    }
    return prefetch;
}

/**
 * @param { string } path 
 */
export async function listModules(path) {
    /**@type { Registry } */
    const registry = {};

    const elements = await readdir(path, {
        withFileTypes: true
    }).catch(__array);

    await Promise.all(elements.map(element => processModulesEntry(element, path, registry, null)));

    return registry;
}

/**
 * @param { Dirent } element 
 * @param { string } path 
 * @param { Registry } registry 
 * @param { string | null } namespaces 
 */
function processModulesEntry(element, path, registry, namespaces) {
    if (element.isDirectory()) return processModulesDirectory(element, path, registry, namespaces);
    if (element.isSymbolicLink()) return processModulesSymbolicLink(element, path, registry, namespaces);
}
/**
 * @param { Dirent } element 
 * @param { string } path 
 * @param { Registry } registry 
 * @param { string | null } namespaces 
 */
async function processModulesSymbolicLink(element, path, registry, namespaces) {
    const link = await readlink(resolve(element.path, element.name));
    const stats = await lstat(resolve(element.path, link));
    if (stats.isDirectory()) return processModulesDirectory(element, path, registry, namespaces);
}
/**
 * @param { Dirent } element 
 * @param { string } path 
 * @param { Registry } registry 
 * @param { string | null } namespaces 
 */
function processModulesDirectory(element, path, registry, namespaces) {
    const { name } = element
    const folder = resolve(path, name);
    if (name.startsWith("@")) {
        if (namespaces === null) return processNamespace(name, folder, registry);
    } else return processModule(namespaces, name, folder, registry);
}

/**
 * @param { string } namespace 
 * @param { string } path 
 * @param { Registry } registry 
 */
async function processNamespace(namespace, path, registry) {
    const elements = await readdir(path, { withFileTypes: true });
    await Promise.all(elements.map(element => processModulesEntry(element, path, registry, namespace)))
}

const EXTENSIONS = [".js", ".cjs", ".mjs", ".json"];

/**
 * @param { string | null } namespace 
 * @param { string } name 
 * @param { string } path 
 * @param { Registry } registry 
 */
async function processModule(namespace, name, path, registry) {
    if (namespace !== null) name = `${namespace}/${name}`;
    if (ignoredModules.some(pattern => matchPattern(pattern, name))) return;

    const buffer = await readFile(resolve(path, "package.json")).catch(__null);
    if (buffer == null) return;
    /**@type { pjson } */
    const pjson = JSON.parse(buffer);

    const {
        dependencies = {},
        exports = {},
        type = "commonjs",
        main = "index.js",
        prefetch: prefetchPatterns = [],
        editable: editablePatterns = [],
        stylesheet: stylesheetPatterns = [],
        kind
    } = pjson;

    for (let i = 0; i < prefetchPatterns.length; i++) {
        prefetchPatterns[i] = normalize(prefetchPatterns[i]).replaceAll(sep, "/");
    }
    for (let i = 0; i < editablePatterns.length; i++) {
        editablePatterns[i] = normalize(editablePatterns[i]).replaceAll(sep, "/");
    }
    for (let i = 0; i < stylesheetPatterns.length; i++) {
        stylesheetPatterns[i] = normalize(stylesheetPatterns[i]).replaceAll(sep, "/");
    }

    /**@type { Record<string, string> } */
    const importmapInclude = {};
    /**@type { string[] } */
    const importmapExclude = [];

    const fileList = await readdir(path, { recursive: true });
    // const fileList = await filesPrmise;
    /**@type { string[] } */
    const files = [];
    /**@type { string[] } */
    const prefetch = [];
    /**@type { string[] } */
    const editable = [];
    /**@type { string[] } */
    const stylesheet = [];

    for (const file of fileList) {
        const path = file.replaceAll(sep, "/");
        if (EXTENSIONS.includes(extname(file))) files.push(path);
        if (prefetchPatterns.some(pattern => matchPattern(pattern, path))) prefetch.push(`/modules/${name}/${path}`);
        if (editablePatterns.some(pattern => matchPattern(pattern, path))) editable.push(`/modules/${name}/${path}`);
        if (stylesheetPatterns.some(pattern => matchPattern(pattern, path))) stylesheet.push(`/modules/${name}/${path}`);
    }

    exports["."] ??= main;

    for (const exportName in exports) {
        const normalizedName = normalize(exportName).replaceAll(sep, "/");
        const exportValue = exports[exportName];

        if (exportValue === null) {
            importmapExclude.push(exportName);
        } else if (typeof exportValue === "object") {
            handleExportRecord(importmapInclude, name, files, type, normalizedName, exportValue);
        } else if (typeof exportValue === "string") {
            const normalizedValue = normalize(exportValue).replaceAll(sep, "/");
            handleExportPath(importmapInclude, name, files, normalizedName, normalizedValue);
        } else throw new Error();
    }

    /**@type { Record<string, string> } */
    const importmap = {};
    for (const key in importmapInclude) {
        if (importmapExclude.includes(key)) continue;
        importmap[key] = importmapInclude[key];
    }
    /**@type { ModuleRecord } */
    const record = (registry[name] = {
        type,
        exports: /**@type {Record<string, pjsonExportRecord>} */ (exports),
        dependencies: Object.keys(dependencies),
        files,
        importmap,
    });
    if (kind !== undefined) record.kind = kind;
    if (prefetch.length > 0) record.prefetch = prefetch;
    if (editable.length > 0) record.editable = editable;
    if (stylesheet.length > 0) record.stylesheet = stylesheet;
}

/**
 * @param { Record<string, string> } importmap 
 * @param { string } pkg 
 * @param { string [] } files 
 * @param { packageType } type 
 * @param { string } path 
 * @param { pjsonExportRecord } record 
 */
function handleExportRecord(importmap, pkg, files, type, path, record) {
    /**@type { string } */
    let destination;
    switch (type) {
        case "module":
            destination = record.import ?? record.default ?? __throw(new Error());
            break;
        case "commonjs":
            destination = record.require ?? record.default ?? __throw(new Error());
            break
        default: throw new Error();
    }
    const normalizedDestination = normalize(destination).replaceAll(sep, "/");
    return handleExportPath(importmap, pkg, files, path, normalizedDestination);
}
/**
 * @param { Record<string, string> } importmap 
 * @param { string } pkg 
 * @param { string [] } files 
 * @param { string } path 
 * @param { string } destination 
 */
function handleExportPath(importmap, pkg, files, path, destination) {
    const p = count(path, "*"), d = count(destination, "*");
    if (p !== d) return void console.warn(pkg, path);
    switch (p + d) {
        case 0: return handleFileExportPath(importmap, pkg, path, destination);
        case 2: return handleFolderExportPath(importmap, pkg, files, path, destination);
        default: return void console.warn(pkg, path);
    }
}

/**
 * @param { Record<string, string> } importmap 
 * @param { string } pkg 
 * @param { string } path 
 * @param { string } destination 
 */
function handleFileExportPath(importmap, pkg, path, destination) {
    const key = join(pkg, path).replaceAll(sep, "/");
    const value = join("/modules", pkg, destination).replaceAll(sep, "/");
    importmap[key] = value;
}
/**
 * @param { Record<string, string> } importmap 
 * @param { string } pkg 
 * @param { string [] } files 
 * @param { string } path 
 * @param { string } destination 
 */
function handleFolderExportPath(importmap, pkg, files, path, destination) {
    const [pLHS, pRHS] = path.split("*");
    const [dLHS, dRHS] = destination.split("*");
    for (const file of files) if (file.startsWith(dLHS) && file.endsWith(dRHS)) {
        const substitutions = file.substring(dLHS.length, file.length - dRHS.length);
        const key = join(pkg, pLHS, substitutions, pRHS).replaceAll(sep, "/");
        const value = join("/modules", pkg, dLHS, substitutions, dRHS).replaceAll(sep, "/");
        importmap[key] = value;
    }
}

/**
 * @param { string } pattern 
 * @param { string } subject 
 */
function matchPattern(pattern, subject) {
    switch (count(pattern, "*")) {
        case 0: return matchPatternExact(pattern, subject)
        case 1: return matchPatternWildcard(pattern, subject);
        default: return void console.warn(pattern, subject);
    }
}

/**
 * @param { string } pattern 
 * @param { string } subject 
 */
function matchPatternExact(pattern, subject) {
    return pattern === subject;
}

/**
 * @param { string } pattern 
 * @param { string } subject 
 */
function matchPatternWildcard(pattern, subject) {
    const [lhs, rhs] = pattern.split("*");
    return subject.startsWith(lhs) && subject.endsWith(rhs);
}
