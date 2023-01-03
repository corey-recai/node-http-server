import * as http from "http";
import * as url from "url";
import { StringDecoder } from "string_decoder";
import { isEmpty } from "./lib/utils";

import type { Handlers } from "./lib/interfaces";

// the server should respond to all requests with a string

const server = http.createServer((req, res) => {
  // get the url and parse the path and query
  const { pathname, query: _query } = url.parse(req.url as string, true);
  const query = { ..._query };
  const trimmedPath = (pathname as string).replace(/^\/+|\/+$/g, "");

  // get the method and headers
  const { method: _method, headers } = req;
  const method = (_method as string).toUpperCase();

  // optionally allocate a buffer to predefined memory
  const decoder = new StringDecoder("utf-8");
  let buffer: string = "";

  req.on("data", chunk => {
    buffer += decoder.write(chunk);
  });

  req.on("end", () => {
    buffer += decoder.end();

    // route request to handler
    // if not found use notFound handler
    let handler;

    if (typeof router[trimmedPath] !== "undefined") {
      handler = router[trimmedPath];
    } else {
      handler = handlers.notFound;
    }

    const data = {
      trimmedPath: trimmedPath,
      query: query,
      method: method,
      headers: headers,
      payload: buffer,
    };

    handler(data, (status: number, payload: {}) => {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(status);
      // send the response
      res.end(JSON.stringify(payload));
      //   HTTP Requests
      // -------------
      // GET /                          200 OK
      console.log("\nHTTP Request\n-------------");
      console.log(`${method} ${pathname}\t${status}`);

      console.log("\nHTTP Payload\n-------------");
      console.log(payload);
    });

    // log the request info

    // console.log("\nHTTP Headers\n-------------");
    // console.log(headers);

    // if (!isEmpty(query)) {
    //   console.log("\nHTTP Query\n-------------");
    //   console.log(JSON.stringify(query, null, 2));
    // }

    // if (buffer.length > 0) {
    //   console.log("\nHTTP Payload\n-------------");
    //   console.log(buffer);
    // }
  });
});

// start server, and listen on port 8080
server.listen(8080, () => {
  console.log("listening on port 8080");
});

const handlers: Handlers = {};

handlers.sample = (data, callback) => {
  // callback http status code & payload object
  callback(406, data);
};

handlers.notFound = (_, callback) => {
  callback(404);
};

interface Router {
  [key: string]: any;
}

const router: Router = {
  sample: handlers.sample,
};
