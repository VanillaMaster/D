import { client } from "@builtin/rpc/client";

client.request("echo", { text: "Hello, World!" }).then(console.log);