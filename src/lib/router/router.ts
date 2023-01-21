interface Router {
  [key: string]: any;
}

const router: Router = {
  ping: handlers.ping,
};
