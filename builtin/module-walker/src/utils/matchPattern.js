import { count } from "./count.js";

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
