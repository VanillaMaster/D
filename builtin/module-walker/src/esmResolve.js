import { count } from "./utils/count.js";

/**
 * @param { string } a 
 * @param { string } b 
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
 * @param { Exclude<Pjson.exports, Pjson.SubpathExports> } target
 * @param { string | null } patternMatch  
 * @param { readonly string[] } conditions 
 * @returns { string | null | undefined }
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
 * 
 * @param { string } subpath 
 * @param { Pjson.SubpathExports } exports 
 * @param { readonly string[] } conditions 
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
 * 
 * @param { backend.ModuleRecord } pkg 
 * @param { readonly string[] } conditions 
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
* @param { Pjson.exports } exports 
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
 * @param { Pjson.exports } exports 
 * @param { number } type
 * @returns { Pjson.SubpathExports }
 */
export function getExports(exports, type) {
    if (type == 1) return { ".": exports };
    return /**@type { Pjson.SubpathExports } */ (exports);
}