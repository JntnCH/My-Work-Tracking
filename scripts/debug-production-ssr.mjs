import server from "../.output/server/_ssr/ssr.mjs";

const response = await server.fetch(new Request("http://127.0.0.1/"), {}, {});
const body = await response.text();
console.log(JSON.stringify({ status: response.status, contentType: response.headers.get("content-type"), body: body.slice(0, 5000) }, null, 2));
