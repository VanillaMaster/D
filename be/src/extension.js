/**
 * @param { backend.Registry } modules 
 */
export function listExtensions(modules) {
    /**@type { Record<string, string[]> } */
    const extensions = {};
    for (const module in modules) {
        const { kind } = modules[module];
        if (kind !== undefined) extensions[module] = kind;
    }
    return extensions;
}

/**@type { string[] } */
export const list = [];