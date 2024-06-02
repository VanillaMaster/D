import { count } from "./utils/count.js";

/**
 * Compares two strings that may contain a wildcard character ('*') and returns a value indicating their order
 * 
 * ```js
 * const unorderedKyes = ["./*.js", "./esm/*.js"];
 * const orderedKeys = unorderedKyes.sort(patternKeyCompare);
 * const mostSpecificKey = orderedKeys[0]
 * ```
 * 
 * @param { string } a - The first string to compare
 * @param { string } b - The second string to compare
 * @returns { number } - A negative number if `a` should come before `b`, a positive number if `a` should come after `b`, or 0 if they are equal.
 */
export function patternKeyCompare(a, b) {
    const aPatternIndex = a.indexOf('*');
    const bPatternIndex = b.indexOf('*');
    const baseLenA = aPatternIndex === -1 ? a.length : aPatternIndex + 1;
    const baseLenB = bPatternIndex === -1 ? b.length : bPatternIndex + 1;
    if (baseLenA > baseLenB) return -1;
    if (baseLenB > baseLenA) return 1;
    if (aPatternIndex === -1) return 1;
    if (bPatternIndex === -1) return -1;
    if (a.length > b.length) return -1;
    if (b.length > a.length) return 1;
    return 0;
}

/**
 * Resolves the target of a package based on the provided conditions
 * 
 * ```js
 * const target = packageTargetResolve({ default: "./*.js"}, "index", ["node", "import", "default"])
 * ```
 * 
 * @param { Exclude<Pjson.exports, Pjson.SubpathExports> } target The target to resolve
 * @param { string | null } patternMatch Substitution for pattern, or null if pattern wasnt used
 * @param { readonly string[] } conditions The conditions to match
 * @returns { string | null | undefined } The resolved target, or null if not found, or undefined if not resolvable
 */
export function packageTargetResolve(target, patternMatch, conditions) {
    if (typeof target === "string") {
        if (patternMatch == null) return target;
        return target.replaceAll("*", patternMatch);
    } else if (target === null) {
        return null;
    } else if (Array.isArray(target)) {
        if (target.length == 0) return null;
        /**@type { string | null | undefined } */
        let last;
        for (const targetValue of target) {
            const resolved = (last = packageTargetResolve(targetValue, patternMatch, conditions));
            if (resolved === undefined) continue;
            return resolved;
        }
        if (last === null) return null;
        throw new Error();
    } else {
        for (const [p, targetValue] of /**@type { [key: keyof Pjson.ConditionalExports, value: Exclude<Pjson.ConditionalExports[keyof Pjson.ConditionalExports], undefined> ][]} */(Object.entries(target))) {
            if (conditions.includes(p)) {
                const resolved = packageTargetResolve(targetValue, patternMatch, conditions);
                if (resolved === undefined) continue;
                return resolved;
            }
        }
        return undefined
    }
}


/**
 * Resolves exports of a package based on the provided conditions
 * 
 * ```js
 * const target = exportsResolve(pjson.exports, ".", ["node", "import", "default"])
 * ```
 * 
 * @param { string } subpath Subpath to resolve
 * @param { Pjson.SubpathExports } exports Subpath exports object
 * @param { readonly string[] } conditions The conditions to match
 * @returns { string | null | undefined } The resolved target, or null if not found, or undefined if not resolvable
 */
export function exportsResolve(subpath, exports, conditions) {
    if (!subpath.includes("*") && subpath in exports) {
        const target = exports[/**@type { keyof Pjson.SubpathExports }**/(subpath)];
        return packageTargetResolve(target, null, conditions);
    }

    const expansionKeys = [];
    for (const key in exports) if (count(key, "*") == 1) expansionKeys.push(key);
    expansionKeys.sort(patternKeyCompare);

    for (const expansionKey of expansionKeys) {
        const patternBase = expansionKey.substring(0, expansionKey.indexOf("*"))
        if (subpath.startsWith(patternBase) && subpath !== patternBase) {
            const patternTrailer = expansionKey.substring(expansionKey.indexOf("*") + 1)
            if (patternTrailer.length == 0 || (subpath.endsWith(patternTrailer) && subpath.length >= expansionKey.length)) {
                const target = exports[/**@type { keyof Pjson.SubpathExports }**/(expansionKey)];
                const patternMatch = subpath.substring(patternBase.length, subpath.length - patternTrailer.length);
                return packageTargetResolve(target, patternMatch, conditions);
            }
        }
    }

    return null;
}

/**
 * Resolves all exports of module, available for provided conditions
 * 
 * ```js
 * const origins = exportsResolvePackage(moduleRecord, ["node", "import", "default"]);
 * ```
 * 
 * @param { backend.ModuleRecord } pkg Record of module for which exports to resolve
 * @param { readonly string[] } conditions The conditions to match
 * @returns { Record<string, string> } Object with subpath as key and corresponding resolution as value
 */
export function exportsResolvePackage(pkg, conditions) {
    /**@type { Record<string, string> } */
    const exports = {};
    for (const origin of pkg.origins) {
        const resolved = exportsResolve(origin, pkg.exports, conditions);
        if (typeof resolved == "string" && pkg.files.includes(resolved)) {
            exports[origin] = resolved
        }
    }
    return exports;
}

/**
 * Determine exports object type
 * 
 * shorthand exports:
 * ```js
 * const type = getExportsType(pjson.exports);
 * ```
 * 
 * @param { Pjson.exports } exports Exports record value
 * @returns { number } `0` for subpath exports, `1` for shorthand exports, 2 for invalid exports object 
 */
export function getExportsType(exports) {
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
 * Convert valid exports record value to subpath exports object
 * 
 * subpath exports:
 * ```js
 * const type = getExportsType(pjson.exports);
 * const exports = getExports(pjson.exports, type)
 * ```
 * 
 * @param { Pjson.exports } exports Valid exports record value
 * @param { number } type Exports object type
 * @returns { Pjson.SubpathExports } Subpath exports object
 */
export function getExports(exports, type) {
    if (type == 1) return { ".": exports };
    return /**@type { Pjson.SubpathExports } */ (exports);
}