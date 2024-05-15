/**
 * @param { backend.Registry } modules 
 */
export function computeEditableList(modules) {
    /**@type { string[] } */
    const editable = [];
    for (const module in modules) {
        const { editable: localEditable } = modules[module];
        if (localEditable !== undefined) editable.push(...localEditable);
    }
    return editable;
}