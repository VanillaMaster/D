import { router } from "@builtin/backend/server";
import { handleParametricFileRead } from "./handleParametricFileRead.js";
import { MODULES_FOLDER } from "@builtin/config/server"

router.get("/modules/*", function(req, res, params){
    handleParametricFileRead(req, res, /**@type { { "*": string } } */ (params), MODULES_FOLDER);
})