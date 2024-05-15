import { router } from "@builtin/backend/server"
import { handleParametricFileRead, handleStaticFileRead } from "@builtin/staticfiles"
import { join, dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { CACHE_FOLDER } from "@builtin/config/server"
import { cacheDocument } from "./document.js"
import { registry } from "@builtin/module-walker/server"

const documentCachePath = resolve(CACHE_FOLDER, "index.html");
const __dirname = dirname(fileURLToPath(import.meta.url));

const assetsFolder = join(__dirname, "../assets/");
const documentPath = join(__dirname, "../index.html");
const workerPath = join(assetsFolder, "worker.js");

await cacheDocument(await registry(), documentPath, documentCachePath);

router.get("/assets/*", function(req, res, params){
    handleParametricFileRead(req, res, /**@type { { "*": string } } */ (params), assetsFolder);
})

router.get("/worker", function(req, res){
    handleStaticFileRead(req, res, workerPath);
});

router.get("/", function(req, res) {
    handleStaticFileRead(req, res, documentCachePath);
});