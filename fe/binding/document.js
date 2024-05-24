import { join, sep } from "node:path"
import mustache from "mustache";
import { readFile, writeFile } from "node:fs/promises"

/**
 * @param { backend.Registry } modules 
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
 * @param { backend.Registry } modules 
 * @param { string } documentPath 
 * @param { string } documentCachePath 
 */
export async function cacheDocument(modules, documentPath, documentCachePath) {

    const template = await readFile(documentPath, { encoding: "utf8"});
    const importmap = JSON.stringify(computeImportMap(modules));
    const prefetch = computePrefetchList(modules);
    const stylesheet = computeStylesheetList(modules);

    const document = mustache.render(template, { importmap, prefetch, stylesheet });
    await writeFile(documentCachePath, document);
}