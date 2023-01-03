import * as http from "http";
import * as https from "https";
import * as url from "url";
import * as fs from "fs";
import { StringDecoder } from "string_decoder";
import { isEmpty } from "./lib/utils";
import environment from "../config";
import type { Handlers } from "./lib/interfaces";

interface ServerMessage {
  req: http.IncomingMessage;
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  };
}

type Server = http.Server | https.Server;

process.on("exit", code => {
  return console.info(`exiting with code ${code}.`);
});

let server: Server;
let port = environment.port.http;

switch (process.argv[2]) {
  case "http":
    port = environment.port.http;
    server = http.createServer((req, res) => {
      handleServerMessage({ req, res });
    });
    break;
  case "https":
    port = environment.port.https;
    const options = {
      key: fs.readFileSync("src/https/key.pem"),
      cert: fs.readFileSync("src/https/cert.pem"),
    };
    server = https.createServer(options, (req, res) => {
      handleServerMessage({ req, res });
    });
    break;
  default:
    console.error("Please specify a valid server type.");
    process.exit(0);
}

console.log(environment);

const handleServerMessage = ({ req, res }: ServerMessage) => {
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

  req.on("data", (chunk: Buffer) => {
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
};

// start server, and listen on port 8080
server.listen(port, () => {
  console.log(`listening on port ${port}`);
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
