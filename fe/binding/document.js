import { join, sep } from "node:path"
import mustache from "mustache";
import { readFile, writeFile } from "node:fs/promises"
import { exportsResolvePackage } from "@builtin/module-walker/esm"

/**@type { readonly string[] } */
const CJS_CONDITIONS = ["require", "default"];
/**@type { readonly string[] } */
const ESM_CONDITIONS = ["import", "default"];

/**
 * @param { backend.Registry } modules 
 */
export function computeImportMap(modules) {
    const importmap = {
        /**@type { Record<string, string> } */
        imports: {}
    }
    for (const name in modules) {
        const pkg = modules[name];
        /**@type { Record<string, string> } */
        if (pkg.type == "commonjs") {
            const exports = exportsResolvePackage(pkg, CJS_CONDITIONS);
            for (const entry in exports) {
                const path = exports[entry];
                const params = new URLSearchParams();
                params.append("sw", "intercept");
                params.append("type", "cjs");
                params.append("pkg", name);
                if (entry !== ".") params.append("entry", entry);
                importmap.imports[join(name, entry).replaceAll(sep, "/")] = join("/modules", name, path).replaceAll(sep, "/") + "?" + params.toString();
            }
        } else if (pkg.type == "module") {
            const exports = exportsResolvePackage(pkg, ESM_CONDITIONS);
            for (const entry in exports) {
                const path = exports[entry];
                importmap.imports[join(name, entry).replaceAll(sep, "/")] = join("/modules", name, path).replaceAll(sep, "/")
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