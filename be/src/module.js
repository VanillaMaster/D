import { readFile, readdir } from "node:fs/promises";

/**
 * @typedef ModuleRecord
 * @property { "commonjs" | "module" } type
 * @property { Record<string, pjsonExportRecord> } exports
 * @property { string[] } dependencies
 * @property { string[] } files
 * @property { Record<string, string> } importmap
 * 
 * @typedef { Record<string, ModuleRecord>} Registry
 */

import { existsSync } from "node:fs";
/**
 * @param { URL } root 
 */
function* paths(root) {
    yield root;
    while (root.pathname !== "/" && !root.pathname.endsWith(":/")) {
        yield root = new URL("..", root);
    }
}

/**
 * @param { string | URL } entry
 */
export function getModuleRoot(entry) {
    for (const root of paths(new URL(".", entry))) {
        const pjson = new URL("package.json", root);
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
    // Object.assign(
    //     importmap.imports,
    //     ...Object.values(modules).map(m => m.importmap)
    // );
    return importmap;
}

/**
 * @param { URL } modulesFolder 
 */
export async function listModules(modulesFolder) {
    /**@type { Registry } */
    const registry = {};

    const elements = await readdir(modulesFolder, {
        withFileTypes: true
    }).catch(__array);

    /**@type { Promise<void>[] } */
    const tasks = []

    for (const element of elements) {
        const { name } = element
        const url = new URL(`${name}/`, modulesFolder);
        if (name.startsWith("@")) {
            tasks.push(namespace(url, registry));
        } else {
            tasks.push(module(url, registry));
        }
    }
    // for (const task of tasks) await task;
    await Promise.all(tasks);

    return registry;
}

/**
 * @param { URL } namespaceUrl 
 * @param { Registry } registry 
 */
async function namespace(namespaceUrl, registry) {
    const files = await readdir(namespaceUrl);
    const tasks = [];
    for (const file of files) {
        const url = new URL(`./${file}/`, namespaceUrl);
        tasks.push(module(url, registry));
    }
    await Promise.all(tasks);
}

const EXTENSIONS = [".js", ".cjs", ".mjs"];

/**
 * @param { URL } url 
 * @param { Registry } registry 
 */
async function module(url, registry) {

    const pjsonUrl = new URL("package.json", url);
    const buffer = await readFile(pjsonUrl).catch(__null);
    if (buffer == null) return;
    /**@type { pjson } */
    const pjson = JSON.parse(buffer);

    const {
        name,
        dependencies = {},
        exports = {},
        type = "commonjs",
        main = "./index.js"
    } = pjson;

    /**@type { Record<string, string> } */
    const importmapInclude = {};
    /**@type { string[] } */
    const importmapExclude = [];

    const filesPrmise = readdir(url, { recursive: true });
    const fileList = await filesPrmise;
    /**@type { string[] } */
    const files = [];
    for (const file of fileList) for (const ext of EXTENSIONS) if (file.endsWith(ext)) {
        files.push(`./${file.replaceAll("\\", "/")}`);
        break;
    }

    if (!("." in exports)) {
        let defaultExport = main;
        if (!main.startsWith("./")) defaultExport = `./${defaultExport}`;
        exports["."] = defaultExport;
    }

    for (const exportName in exports) {
        const exportValue = exports[exportName];
        if (exportValue === null) {
            importmapExclude.push(exportName);
            continue;
        }
        if (typeof exportValue === "object") {
            handleExportRecord(importmapInclude, name, files, type, exportName, exportValue);
            continue;
        }
        if (typeof exportValue === "string") {
            handleExportPath(importmapInclude, name, files, exportName, exportValue);
            continue;
        }

        throw new Error();
    }

    /**@type { Record<string, string> } */
    const importmap = {};
    for (const key in importmapInclude) {
        if (importmapExclude.includes(key)) continue;
        importmap[key] = importmapInclude[key];
    }

    registry[name] = {
        type,
        exports: /**@type {Record<string, pjsonExportRecord>} */ (exports),
        dependencies: Object.keys(dependencies),
        files,
        importmap
    };
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
    if (type == "module") {
        if (record.import !== undefined) {
            return handleExportPath(importmap, pkg, files, path, record.import);
        } else if (record.default !== undefined) {
            return handleExportPath(importmap, pkg, files, path, record.default);
        }
        throw new Error();
    }
    if (type == "commonjs") {
        if (record.require !== undefined) {
            return handleExportPath(importmap, pkg, files, path, record.require);
        } else if (record.default !== undefined) {
            return handleExportPath(importmap, pkg, files, path, record.default);
        }
        throw new Error();
    }
    throw new Error();
}
/**
 * @param { Record<string, string> } importmap 
 * @param { string } pkg 
 * @param { string [] } files 
 * @param { string } path 
 * @param { string } destination 
 */
function handleExportPath(importmap, pkg, files, path, destination) {
    if (path.includes("*")) {
        return handleFolderExportPath(importmap, pkg, files, path, destination);
    } else {
        return handleFileExportPath(importmap, pkg, path, destination);
    }
}

/**
 * @param { Record<string, string> } importmap 
 * @param { string } pkg 
 * @param { string } path 
 * @param { string } destination 
 */
function handleFileExportPath(importmap, pkg, path, destination) {
    const key = pkg + path.substring(1);
    const value = `/modules/${pkg}${destination.substring(1)}`;
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
    const trimmedPLHS = pLHS.substring(1);
    const [dLHS, dRHS] = destination.split("*");
    const trimmedDLHS = dLHS.substring(1);
    for (const file of files) if (file.startsWith(dLHS) && file.startsWith(dRHS)) {
        const substitutions = file.substring(dLHS.length, file.length - dRHS.length);
        const key = `${pkg}${trimmedPLHS}${substitutions}${pRHS}`;
        const value = `/modules/${pkg}${trimmedDLHS}${substitutions}${dRHS}`;
        importmap[key] = value;
    }
}