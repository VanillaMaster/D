import { lstat, readFile, readdir, readlink } from "node:fs/promises";
import { resolve, parse, dirname, extname, sep, normalize, join } from "node:path"
import { fileURLToPath } from "node:url"
import { Dirent, existsSync } from "node:fs";
import { ignoredExtensions, ignoredModules } from "./config.js";

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
 * @param { backend.PjsonExportRecord | backend.PjsonExportMap } exports
 * @param { boolean } hasKeysWithDot 
 * @returns { exports is backend.PjsonExportRecord }
 */
function isPjsonExportRecord(exports, hasKeysWithDot) {
    return !hasKeysWithDot;
}

/**
 * @param { backend.PjsonExportRecord | backend.PjsonExportMap } exports
 * @param { boolean } hasKeysWithoutDot 
 * @returns { exports is backend.PjsonExportMap }
 */
function isPjsonExportMap(exports, hasKeysWithoutDot) {
    return !hasKeysWithoutDot
}

/**
 * @param { backend.PjsonExportRecord | backend.PjsonExportMap } exports
 * @param { boolean } hasKeysWithDot 
 * @param { boolean } hasKeysWithoutDot 
 * @returns { exports is backend.PjsonExportMap }
 */
function isEmptyPjsonExportMap(exports, hasKeysWithDot, hasKeysWithoutDot) {
    return !(hasKeysWithDot || hasKeysWithoutDot);
}

/**
 * @param { Record<string, backend.ModuleRecord> } modules 
 */
export function computeImportMap(modules) {
    const importmap = {
        /**@type { Record<string, string> } */
        imports: {}
    }
    for (const pkg in modules) {
        const { exports, type } = modules[pkg];
        if (type == "commonjs") for (const entry in exports) {
            const path = exports[entry];
            const params = new URLSearchParams();
            params.append("sw", "intercept");
            params.append("type", "cjs");
            params.append("pkg", pkg);
            if (entry !== ".") params.append("entry", entry);
            importmap.imports[join(pkg, entry).replaceAll(sep, "/")] = join("/modules", pkg, path).replaceAll(sep, "/") + "?" + params.toString();
        } else if (type == "module") {
            for (const entry in exports) {
                const path = exports[entry];
                importmap.imports[join(pkg, entry).replaceAll(sep, "/")] = join("/modules", pkg, path).replaceAll(sep, "/")
            }
        }
    }
    return importmap;
}

/**
 * @param { Record<string, backend.ModuleRecord> } modules 
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
 * @param { Record<string, backend.ModuleRecord> } modules 
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
 * @param { Record<string, backend.ModuleRecord> } modules 
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
 * @typedef ModulesState
 * @property { backend.Registry } registry
 * @property { backend.Extensions } extensions
 */

/**
 * @param { string } path 
 */
export async function listModules(path) {
    /**@type { ModulesState } */
    const state = {
        registry: {},
        extensions: {}
    }

    const elements = await readdir(path, {
        withFileTypes: true
    }).catch(__array);

    await Promise.all(elements.map(element => processModulesEntry(element, path, state, null)));

    return state
}

/**
 * @param { Dirent } element 
 * @param { string } path 
 * @param { ModulesState } state 
 * @param { string | null } namespaces 
 */
function processModulesEntry(element, path, state, namespaces) {
    if (element.isDirectory()) return processModulesDirectory(element, path, state, namespaces);
    if (element.isSymbolicLink()) return processModulesSymbolicLink(element, path, state, namespaces);
}
/**
 * @param { Dirent } element 
 * @param { string } path 
 * @param { ModulesState } state 
 * @param { string | null } namespaces 
 */
async function processModulesSymbolicLink(element, path, state, namespaces) {
    const link = await readlink(resolve(element.path, element.name));
    const stats = await lstat(resolve(element.path, link));
    if (stats.isDirectory()) return processModulesDirectory(element, path, state, namespaces);
}
/**
 * @param { Dirent } element 
 * @param { string } path 
 * @param { ModulesState } state 
 * @param { string | null } namespaces 
 */
function processModulesDirectory(element, path, state, namespaces) {
    const { name } = element
    const folder = resolve(path, name);
    if (name.startsWith("@")) {
        if (namespaces === null) return processNamespace(name, folder, state);
    } else return processModule(namespaces, name, folder, state);
}

/**
 * @param { string } namespace 
 * @param { string } path 
 * @param { ModulesState } state 
 */
async function processNamespace(namespace, path, state) {
    const elements = await readdir(path, { withFileTypes: true });
    await Promise.all(elements.map(element => processModulesEntry(element, path, state, namespace)))
}

const EXTENSIONS = [".js", ".cjs", ".mjs", ".json"];

/**
 * @param { string | null } namespace 
 * @param { string } name 
 * @param { string } path 
 * @param { ModulesState } state 
 */
async function processModule(namespace, name, path, state) {
    if (namespace !== null) name = `${namespace}/${name}`;

    const buffer = await readFile(resolve(path, "package.json")).catch(__null);
    if (buffer == null) return;
    /**@type { backend.Pjson } */
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

    if (kind !== undefined) {
        if (ignoredExtensions.every(pattern => !matchPattern(pattern, name))) {
            state.extensions[name] = kind;
        }
    }

    if (ignoredModules.some(pattern => matchPattern(pattern, name))) return;

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
    const exportsMapInclude = {};
    /**@type { string[] } */
    const exportsMapExclude = [];

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

    if (typeof exports == "object") {
        let hasKeysWithDot = false, hasKeysWithoutDot = false;
        for (const key in exports) {
            const keyStartsWithDot = key.startsWith(".");
            hasKeysWithDot ||= keyStartsWithDot;
            hasKeysWithoutDot ||= !keyStartsWithDot;
        }

        switch (true) {
            case isEmptyPjsonExportMap(exports, hasKeysWithDot, hasKeysWithoutDot):
                exports["."] = main;
            case isPjsonExportMap(exports, hasKeysWithoutDot):
                handleExportMap(exportsMapInclude, exportsMapExclude, name, files, type, exports)
                break;
            case isPjsonExportRecord(exports, hasKeysWithDot):
                handleExportRecord(exportsMapInclude, name, files, type, ".", exports);
                break;
            default: throw new Error();
        }
    } else if (typeof exports == "string") {
        handleExportPath(exportsMapInclude, name, files, ".", exports);
    } else throw new Error();

    /**@type { Record<string, string> } */
    const exportmap = {};
    for (const key in exportsMapInclude) {
        if (exportsMapExclude.includes(key)) continue;
        exportmap[key] = exportsMapInclude[key];
    }
    /**@type { backend.ModuleRecord } */
    const record = (state.registry[name] = {
        type,
        exports: exportmap,
        dependencies: Object.keys(dependencies),
        files,
    });
    if (kind !== undefined) record.kind = kind;
    if (prefetch.length > 0) record.prefetch = prefetch;
    if (editable.length > 0) record.editable = editable;
    if (stylesheet.length > 0) record.stylesheet = stylesheet;
}

/**
 * @param { Record<string, string> } importmapInclude
 * @param { string[] } importmapExclude  
 * @param { string } pkg 
 * @param { string [] } files 
 * @param { backend.PackageType } type 
 * @param { backend.PjsonExportMap} map 
 */
function handleExportMap(importmapInclude, importmapExclude, pkg, files, type, map) {
    for (const exportName in map) {
        const normalizedName = normalize(exportName).replaceAll(sep, "/");
        const exportValue = map[exportName];

        if (exportValue === null) {
            importmapExclude.push(exportName);
        } else if (typeof exportValue === "object") {
            handleExportRecord(importmapInclude, pkg, files, type, normalizedName, exportValue);
        } else if (typeof exportValue === "string") {
            const normalizedValue = normalize(exportValue).replaceAll(sep, "/");
            handleExportPath(importmapInclude, pkg, files, normalizedName, normalizedValue);
        } else throw new Error();
    }
}

/**
 * @param { Record<string, string> } importmap 
 * @param { string } pkg 
 * @param { string [] } files 
 * @param { backend.PackageType } type 
 * @param { string } path 
 * @param { backend.PjsonExportRecord } record 
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
    const key = normalize(path).replaceAll(sep, "/");
    const value = normalize(destination).replaceAll(sep, "/");
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
        const key = join(pLHS, substitutions, pRHS).replaceAll(sep, "/");
        const value = join(dLHS, substitutions, dRHS).replaceAll(sep, "/");
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
