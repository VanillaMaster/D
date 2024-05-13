const CHAR_FORWARD_SLASH = 47;
const CHAR_DOT = 46;

const SEPARATOR = '/';

/**
 * @param { string } path 
 * @param { boolean } allowAboveRoot 
 * @returns { string }
 */
function normalizeString(path, allowAboveRoot) {
    let res = '';
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code = 0;

    for (let i = 0; i <= path.length; ++i) {
        if (i < path.length) code = path.charCodeAt(i);
        else if (code === CHAR_FORWARD_SLASH) break;
        else code = CHAR_FORWARD_SLASH;

        if (code === CHAR_FORWARD_SLASH) {
            if (lastSlash === i - 1 || dots === 1) {
                // NOOP
            } else if (dots === 2) {
                if (
                    res.length < 2 || lastSegmentLength !== 2 ||
                    res.charCodeAt(res.length - 1) !== CHAR_DOT ||
                    res.charCodeAt(res.length - 2) !== CHAR_DOT
                ) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(SEPARATOR);
                        if (lastSlashIndex === -1) {
                            res = '';
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(SEPARATOR);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length !== 0) {
                        res = '';
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    res += res.length > 0 ? `${SEPARATOR}..` : '..';
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += `${SEPARATOR}${path.slice(lastSlash + 1, i)}`;
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === CHAR_DOT && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}

/**
 * @param { string } path
 * @returns { string }
 */
export function normalize(path) {
    if (path.length === 0) return '.';

    const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    const trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;

    // Normalize the path
    path = normalizeString(path, !isAbsolute);

    if (path.length === 0) {
        if (isAbsolute) return '/';
        return trailingSeparator ? './' : '.';
    }
    if (trailingSeparator) path += '/';
    return isAbsolute ? `/${path}` : path;
}
/**
 * @param { ...string } args
 * @returns { string }
 */
export function join(...args) {
    if (args.length === 0) return '.';
    /**@type { string | undefined } */
    let joined = args.length > 0 ? args[0] : undefined;
    for (let i = 1; i < args.length; ++i) {
        const arg = args[i];
        if (arg.length > 0) joined += `/${arg}`;
    }
    if (joined === undefined) return '.';
    return normalize(joined);
}