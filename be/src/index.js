import Router from "find-my-way";
import { createServer } from "node:http";
import { extensions } from "@builtin/module-walker/server"
import { PORT } from "@builtin/config/server";

export const router = Router({
    defaultRoute(req, res){
        res.statusCode = 404;
        res.end();
    }
});

export const server = createServer();
server.on("request", function(req, res) {
    router.lookup(req, res);
});

(function(extensions){
    Promise.all(
        Object.keys(extensions)
            .filter(extension => extensions[extension].includes("server"))
            .map(extension => import(`${extension}/server`))
    ).then(function(){
        server.listen(PORT);
        console.log(PORT);
    }).catch(function(e) {
        console.error(e);
    });

})(await extensions())