import * as http from "http";
import * as url from "url";
import { isEmpty } from "./lib/utils";

// the server should respond to all requests with a string

const server = http.createServer((req, res) => {
  // get the url and parse the path and query
  const { pathname, query } = url.parse(req.url as string, true);
  const trimmedPath = (pathname as string).replace(/^\/+|\/+$/g, "");

  // get the http method
  const method = (req.method as string).toUpperCase();

  // send the response
  res.end("hello world\n");

  // log the path from the request
  console.log(`${method}: ${trimmedPath}`);
  if (!isEmpty(query)) console.log(JSON.stringify(query, null, 2));
});

// start server, and listen on port 8080
server.listen(8080, () => {
  console.log("listening on port 8080");
});
