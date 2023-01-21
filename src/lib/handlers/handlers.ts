import type { Handlers } from "../../interfaces";

const handlers: Handlers = {};

handlers.ping = (data, callback) => {
  callback(200);
};

handlers.notFound = (data, callback) => {
  callback(404);
};
