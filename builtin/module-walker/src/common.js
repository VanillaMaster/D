/**
 * @param { string } self 
 * @param { string } searchString 
 * @param { number } [position] 
 */
export function count(self, searchString, position = 0) {
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
export function __throw(err) {
    throw err;
}

/**
 * @returns { never[] }
 */
export function __array() { return []; }
export function __null() { return null; }

/**
 * @param { backend.PjsonExportRecord | backend.PjsonExportMap } exports
 * @param { boolean } hasKeysWithDot 
 * @returns { exports is backend.PjsonExportRecord }
 */
export function isPjsonExportRecord(exports, hasKeysWithDot) {
    return !hasKeysWithDot;
}

/**
 * @param { backend.PjsonExportRecord | backend.PjsonExportMap } exports
 * @param { boolean } hasKeysWithoutDot 
 * @returns { exports is backend.PjsonExportMap }
 */
export function isPjsonExportMap(exports, hasKeysWithoutDot) {
    return !hasKeysWithoutDot
}

/**
 * @param { backend.PjsonExportRecord | backend.PjsonExportMap } exports
 * @param { boolean } hasKeysWithDot 
 * @param { boolean } hasKeysWithoutDot 
 * @returns { exports is backend.PjsonExportMap }
 */
export function isEmptyPjsonExportMap(exports, hasKeysWithDot, hasKeysWithoutDot) {
    return !(hasKeysWithDot || hasKeysWithoutDot);
}

/**
 * @param { string } pattern 
 * @param { string } subject 
 */
export function matchPattern(pattern, subject) {
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
