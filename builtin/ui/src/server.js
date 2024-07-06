import { server } from "@builtin/communication/server"

server.addMethod("echo", ({ text }) => text);
server.addMethod("log", ({ message }) => console.log(message));