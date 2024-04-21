import { readFile, writeFile } from "fs/promises";
import { cacheFolder, modulesFolder, rootpagePath } from "./config.js";
import { computeImportMap, listModules } from "./module.js";
import { render } from "./template.js";

const modulesCachePath = new URL("./modules.json", cacheFolder)
const documentCachePath = new URL("./index.html", cacheFolder);
/**@type { Record<string, Buffer> } */
const modulesBuffers = {};

{
    const modules = await listModules(modulesFolder);
    await writeFile(modulesCachePath, JSON.stringify(modules, undefined, 4));
    
    const importmap = JSON.stringify(await computeImportMap(modules));
    const template = await readFile(rootpagePath, { encoding: "utf8"});
    const document = render(template, {
        importmap
    });
    await writeFile(documentCachePath, document);
    
    for (const key in modules) {
        modulesBuffers[key] = Buffer.from(JSON.stringify(modules[key]));
    }
}


export {
    modulesCachePath,
    documentCachePath,
    modulesBuffers as modules
}
