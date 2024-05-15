import { router } from "@builtin/backend/server"
import { handleParametricFileRead, handleStaticFileRead } from "@builtin/staticfiles"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { CACHE_FOLDER } from "@builtin/config/server"
import mustache from "mustache";

const assetsFolder = join(dirname(fileURLToPath(import.meta.url)), "../assets/");
const workerPath = join(assetsFolder, "worker.js");

router.get("/assets/*", function(req, res, params){
    handleParametricFileRead(req, res, /**@type { { "*": string } } */ (params), assetsFolder);
})

router.get("/worker", function(req, res){
    handleStaticFileRead(req, res, workerPath);
});
// console.log(process.cwd());
// router.get("/", function(req, res) {
//     handleStaticFileRead(req, res, documentCachePath);
// });