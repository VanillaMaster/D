/**@import { Registry } from "./module.js" */
import { readFile, writeFile, mkdir } from "fs/promises";
import { cacheFolder, modulesFolder, rootpagePath } from "./config.js";
import { computeImportMap, listModules } from "./module.js";
import { render } from "./template.js";
import { v5, NameSpace_FILE, NameSpace_INDEX } from "./uuid/v5.js";

const modulesCacheFolder = new URL("modules/", cacheFolder);
await mkdir(modulesCacheFolder, { recursive: true });

const modulesCacheIndex = new URL(v5(Buffer.from("modules"), NameSpace_INDEX), modulesCacheFolder);

const documentCachePath = new URL("./index.html", cacheFolder);

{
    const modules = await listModules(modulesFolder);
    await writeFile(modulesCacheIndex, JSON.stringify(modules));
    await cacheModules(modules);

    const importmap = JSON.stringify(await computeImportMap(modules));
    const template = await readFile(rootpagePath, { encoding: "utf8"});
    const document = render(template, {
        importmap
    });
    await writeFile(documentCachePath, document);
}


export {
    modulesCacheIndex,
    modulesCacheFolder,

    documentCachePath,
}

/**
 * @param { Registry } modules 
 */
async function cacheModules(modules) {
    /**@type { Promise<void>[] } */
    const tasks = [];
    for (const module in modules) {
        const name = v5(Buffer.from(module), NameSpace_FILE);
        const path = new URL(name, modulesCacheFolder)
        tasks.push(writeFile(path, JSON.stringify(modules[module])));
    }
    for (const task of tasks) await task;
}