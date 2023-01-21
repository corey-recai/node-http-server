import * as http from "http";
import * as https from "https";
import * as url from "url";
import * as fs from "fs";
import { StringDecoder } from "string_decoder";

import environment from "../../../config";

type Server = http.Server | https.Server;

type ServerType = "http" | "https";

interface ServerMessage {
  req: http.IncomingMessage;
  res: http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
  };
}

// let server: Server;
let port = environment.port.http;

const server = (type: ServerType): Server => {
  switch (type) {
    case "http":
      port = environment.port.http;
      return http.createServer((req, res) => {
        handleServerMessage({ req, res });
      });
    case "https":
      port = environment.port.https;
      const options = {
        key: fs.readFileSync("src/https/key.pem"),
        cert: fs.readFileSync("src/https/cert.pem"),
      };
      return https.createServer(options, (req, res) => {
        handleServerMessage({ req, res });
      });
    default:
      console.error("Please specify a valid server type.");
      process.exit(0);
  }
};

const handleServerMessage = ({ req, res }: ServerMessage) => {
  // get the url and parse the path and query
  const { pathname, query: _query } = url.parse(req.url as string, true);
  const query = { ..._query };
  const trimmedPath = (pathname as string).replace(/^\/+|\/+$/g, "");

  // get the method and headers
  const { method: _method, headers } = req;
  const method = (_method as string).toUpperCase();

  // decoder and buffer for incomming messages to be written to
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
      // use the status code defined by the handler or 200
      if (typeof status !== "number") status = 200;

      // use the payload defined by the handler or an empty object
      if (typeof payload !== "object") payload = {};

      // set response content-type
      res.setHeader("Content-Type", "application/json");

      // set response status code
      res.writeHead(status);

      // send the response
      res.end(JSON.stringify(payload));

      // log the request
      console.log("\nHTTP Request\n-------------");
      console.log(`${method} ${pathname}\t${status}`);

      // log the payload
      console.log("\nHTTP Payload\n-------------");
      console.log(payload);

      // optionally log more detailed request info
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
};

export default server;
