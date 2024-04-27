import { server } from "@builtin/rpc/server"

server.addMethod("echo", ({ text }) => text);
server.addMethod("log", ({ message }) => console.log(message));