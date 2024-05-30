import { lstat, readdir, readFile, readlink } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
/**@import { Dirent } from "node:fs" */

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

const EXTENSIONS = [".js", ".cjs", ".mjs", ".json"];
const PATTERN = Symbol("pattern")

/**
 * @param { Pjson.exports } exports 
 */
function getExportsType(exports) {
    if (typeof exports == "string" || Array.isArray(exports)) return 1;
    if (typeof exports !== 'object' || exports === null) return 0;

    let i = 0;
    let isConditionalSugar = false;

    for (const key in exports) {
        const curIsConditionalSugar = key === '' || key[0] !== '.';
        if (i++ === 0) {
            isConditionalSugar = curIsConditionalSugar;
        } else if (isConditionalSugar !== curIsConditionalSugar) {
            return 2;
        }
    }
    return isConditionalSugar ? 1 : 0;
}
/**
 * 
 * @param { Pjson.exports } exports 
 * @param { number } type
 * @returns { Pjson.SubpathExports }
 */
function getExports(exports, type) {
    if (type == 1) return { ".": exports };
    return /**@type { Pjson.SubpathExports } */ (exports);
}

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
 * @param { string } path path to modules folder 
 */
export async function listModulesV2(path) {
    const elements = await readdir(path, {
        withFileTypes: true
    }).catch(__nullErr);
    if (elements == null) return;
    /**@type { Record<string, Record<string, string>> } */
    const packages = {}
    /**@type { Array<Promise<void> | void> } */
    const tasks = [];
    for (const element of elements) tasks.push(processModulesEntry(element, "", packages));
    while (tasks.length > 0) await tasks.pop();

    console.log(packages);
    debugger
}

/**
 * @param { Dirent } element 
 * @param { string } prefix 
 * @param { Record<string, Record<string, string>> } out
 */
function processModulesEntry(element, prefix, out) {
    if (element.isDirectory()) return processModulesDirectory(resolve(element.parentPath, element.name), element.name, prefix, out);
    if (element.isSymbolicLink()) return processModulesSymbolicLink(element.parentPath, element.name, prefix, out);
}

/**
 * @param { string } path 
 * @param { string } name 
 * @param { string } prefix 
 * @param { Record<string, Record<string, string>> } out
 * @returns { Promise<void> | void }
 */
function processModulesDirectory(path, name, prefix, out) {
    if (name[0] === "@") {
        if (prefix === "") return processNamespace(path, name, out);
    } else return processModule(path, prefix + name, out);
}

/**
 * @param { string } parentPath
 * @param { string } linkName 
 * @param { string } prefix 
 * @param { Record<string, Record<string, string>> } out
 */
async function processModulesSymbolicLink(parentPath, linkName, prefix, out) {
    const linkValue = await readlink(resolve(parentPath, linkName));
    const path = resolve(parentPath, linkValue);
    const stats = await lstat(path);
    if (stats.isDirectory()) return processModulesDirectory(path, linkName, prefix, out);
}

/**
 * @param { string } path
 * @param { string } name
 * @param { Record<string, Record<string, string>> } out
 */
async function processModule(path, name, out) {
    const buffer = await readFile(resolve(path, "package.json")).catch(__null);
    if (buffer == null) return;
    /**@type { Pjson } */
    let pjson
    try {
        pjson = JSON.parse(buffer);
    } catch (error) {
        return void console.error(error);
    }
    const {
        dependencies = {},
        exports: __exports = pjson.main ?? "index.js",
        type = "commonjs",
    } = pjson;
    const exportType = getExportsType(__exports);
    if (exportType == 2) return console.error("invalid package exports");
    const exports = getExports(__exports, exportType);

    const allFiles = await readdir(path, { recursive: true });
    /**@type { string[] } */
    const files = [];
    for (const file of allFiles) {
        const f = `./${normalize(file).replaceAll(sep, "/")}`;
        if (EXTENSIONS.includes(extname(file))) files.push(f);
    }

    /**@type { ExportsTree<string> } */
    const allowedFiles = {};
    /**@type { ExportsTreeWithPattern<string> } */
    const allowedFolders = {};
    /**@type { ExportsTree<null> } */
    const disallowedFiles = {};
    /**@type { ExportsTree<null> } */
    const disallowedFolders = {};

    for (const path in exports) processExportsRecord(
        [],
        /**@type { keyof Pjson.SubpathExports }*/
        path,
        exports[/**@type { keyof Pjson.SubpathExports }*/(path)],
        files,
        allowedFiles,
        allowedFolders,
        disallowedFiles,
        disallowedFolders
    );

    // /**@type { Record<string, Record<string, string>> } */
    // const exportmap = {};

    // for (const path in exports) processExportsRecord(
    //     [],
    //     /**@type { keyof Pjson.SubpathExports }*/
    //     (path),
    //     exports[/**@type { keyof Pjson.SubpathExports }*/(path)],
    //     files,
    //     exportmap
    // );

    console.log(name, allowedFiles, allowedFolders, disallowedFiles, disallowedFolders);
}
/**
 * @param { string } path
 * @param { string } name
 * @param { Record<string, Record<string, string>> } out
 */
async function processNamespace(path, name, out) {
    const elements = await readdir(path, { withFileTypes: true }).catch(__nullErr);
    if (elements == null) return;
    /**@type { Array<Promise<void> | void> } */
    const tasks = [];
    for (const element of elements) tasks.push(processModulesEntry(element, name + "/", out));
    while (tasks.length > 0) await tasks.pop();
}

/**
 * @template T
 * @typedef { { [path in string]: T | ExportsTreeNode<T> } } ExportsTreeNode
 */
/**
 * @template T
 * @typedef { { [path in string]: ExportsTreeNode<T> } } ExportsTree
 */
/**
 * @typedef { { [PATTERN]: string } } ExportsTreeNodeWithPattern
 */
/**
 * @template T
 * @typedef { ExportsTree<T> & { [path in string]: ExportsTreeNodeWithPattern } } ExportsTreeWithPattern
 */

/**
 * @param { string[] } conditions 
 * @param { string } key 
 * @param { string | null | Pjson.ArrayExports | Pjson.ConditionalExports } exports 
 * @param { string[] } files 
 * @param { ExportsTree<string> } allowedFiles 
 * @param { ExportsTreeWithPattern<string> } allowedFolders 
 * @param { ExportsTree<null> } disallowedFiles 
 * @param { ExportsTree<null> } disallowedFolders 
 * @param { boolean } [strict] 
 */
function processExportsRecord(
    conditions,
    key,
    exports,
    files,
    allowedFiles,
    allowedFolders,
    disallowedFiles,
    disallowedFolders,
    strict = true
) {
    if (typeof exports == "string") {
        allowExport(
            conditions,
            key,
            exports,
            files,
            allowedFiles,
            allowedFolders
        );
    } else if (exports == null) {
        if (strict) disallowExport(conditions, key, disallowedFiles, disallowedFolders);

    } else if (Array.isArray(exports)) {
        for (const entry of exports) {
            processExportsRecord(
                conditions,
                key,
                entry,
                files,
                allowedFiles,
                allowedFolders,
                disallowedFiles,
                disallowedFolders,
                false
            );
        }
    } else {
        for (const condition in exports) {
            const entry = (exports[/**@type { keyof Pjson.ConditionalExports }*/(condition)]);
            processExportsRecord(
                [...conditions, condition],
                key,
                /**@type { Exclude<typeof entry, undefined>}*/(entry),
                files,
                allowedFiles,
                allowedFolders,
                disallowedFiles,
                disallowedFolders
            );
        }
    }
}

/**
 * @param { string[] } conditions 
 * @param { string } key 
 * @param { string } value 
 * @param { string[] } files 
 * @param { ExportsTree<string> } allowedFiles 
 * @param { ExportsTreeWithPattern<string> } allowedFolders 
 */
function allowExport(conditions, key, value, files, allowedFiles, allowedFolders) {
    const k = count(key, "*"), v = count(value, "*");
    if (k !== v) return void console.warn(key, value);
    switch (k + v) {
        case 0: return allowFileExport(conditions, key, value, allowedFiles);
        case 2: return allowFolderExport(conditions, key, value, files, allowedFolders);
        default: return void console.warn(key, value);
    }
}

/**
 * @param { string[] } conditions 
 * @param { string } key 
 * @param { ExportsTree<null> } disallowedFiles 
 * @param { ExportsTree<null> } disallowedFolders 
 */
function disallowExport(conditions, key, disallowedFiles, disallowedFolders) {
    const k = count(key, "*");
    switch (k) {
        case 0: return void disallowAnyExport(conditions, key, disallowedFiles);
        case 1: return void disallowAnyExport(conditions, key, disallowedFolders);
        default: return void console.warn(key);
    }
}

/**
 * @param { string[] } conditions 
 * @param { string } key 
 * @param { string } value 
 * @param { ExportsTree<string> } out 
 */
function allowFileExport(conditions, key, value, out) {
    if (conditions.length == 0) {
        (out[key] ??= {})["default"] = value;
    } else {
        let node = (out[key] ??= {});
        const length = conditions.length - 1;
        const k = conditions[length];
        for (let i = 0; i < length; i++) node = /**@type { ExportsTree<string> } */(node[conditions[i]] ??= {});
        node[k] = value;
    }
}

/**
 * @param { string[] } conditions 
 * @param { string } key 
 * @param { ExportsTree<null> } out 
 */
function disallowAnyExport(conditions, key, out) {
    if (conditions.length == 0) {
        (out[key] ??= {})["default"] = null;
    } else {
        let node = (out[key] ??= {});
        const length = conditions.length - 1;
        const k = conditions[length];
        for (let i = 0; i < length; i++) node = /**@type { ExportsTree<null> } */(node[conditions[i]] ??= {});
        node[k] = null;
    }
}

/**
 * @param { string[] } conditions 
 * @param { string } key 
 * @param { string } value 
 * @param { string[] } files 
 * @param { ExportsTreeWithPattern<string> } out 
 */
function allowFolderExport(conditions, key, value, files, out) {
    const [kLHS, kRHS] = key.split("*");
    const [vLHS, vRHS] = value.split("*");
    for (const file of files) if (file.startsWith(vLHS) && file.endsWith(vRHS)) {
        const substitutions = file.substring(vLHS.length, file.length - vRHS.length);
        const k = `./${join(kLHS, substitutions, kRHS).replaceAll(sep, "/")}`;
        const v = `./${join(vLHS, substitutions, vRHS).replaceAll(sep, "/")}`;
        allowFileExport(conditions, k, v, out);
        out[k][PATTERN] = key;
    }
}

// ({
//     ".": "./mustache.mjs",
//     "mustache.js": {
//         "default": {
//             "node": "./node/mustache.js",
//             "default": "./default/mustache.js"
//         },
//         "import": "./default/mustache.js"
//     }
// })
// ({
//     "./asd/*.js": {
//         "default": null
//     }
// })