const exp = /^[\p{ID_Start}$]+[\p{ID_Continue}$_]*$/u;

/**
 * @param { readonly string[] } template
 * @param { any[] } substitutions
 * @returns { string }
 */
function interpolate(template, substitutions) {
    const buffer = new Array(template.length + substitutions.length);
    let i = 0, j = 0;
    for (; i < substitutions.length; i++) {
        buffer[j++] = template[i];
        buffer[j++] = substitutions[i];
    }
    buffer[j] = template[i];
    return buffer.join("");
}

/**
 * @param { string } source 
 */
function parse(source) {
    let i = 0, j = 0, k = 0;
    /**@type { string[] } */
    const template = [];
    /**@type { string[] } */
    const substitutions = [];

    while (true) {
        i = source.indexOf("{", i);
        j = source.indexOf("}", j);
        if (i == -1 && j == -1) {
            template.push(source.substring(k));
            return { template, substitutions };
        }
        if (i == -1) throw new SyntaxError();
        if (j == -1) throw new SyntaxError();
        if (i > j) throw new SyntaxError();
        
        const t = source.substring(k, i);
        const s = source.substring(++i, j++).trim();
        k = j;
        if (!exp.test(s)) throw new SyntaxError();
        template.push(t);
        substitutions.push(s);
    }

}

/**
 * @param { string } template 
 * @param { Record<string, any> } substitutions 
 */
export function render(template, substitutions) {
    const { template: parts, substitutions: names } = parse(template);
    return interpolate(parts, names.map(key => substitutions[key]));
}