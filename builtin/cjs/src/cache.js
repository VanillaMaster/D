/**@import { Module } from "./Module.js" */

/**@type { Set<string> } */
export const loadedPackages = new Set();
/**@type { Map<string, Promise<void>> } */
export const pendingPackages = new Map();
/**@type { Map<string, Module> } */
export const packagesCache = new Map();
/**@type { Map<string, Module> } */
export const modulesCache = new Map();