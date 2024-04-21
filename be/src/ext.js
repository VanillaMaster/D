/**
 * @param { string } pathname 
 */
export function getExt(pathname) {
    const i = pathname.lastIndexOf(".");
    const j = pathname.lastIndexOf("/");
    if ( i == -1 || j > i ) return "";
    return pathname.substring(i + 1);
}