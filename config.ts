interface Environments {
  [key: string]: { name: string; port: { http: number; https: number } };
}

const environments: Environments = {};

environments.development = {
  name: "development",
  port: { http: 3000, https: 3001 },
};

environments.staging = {
  name: "staging",
  port: { http: 5000, https: 5001 },
};

environments.production = {
  name: "production",
  port: { http: 8000, https: 8001 },
};

let node_env = "";

if (typeof (process.env.NODE_ENV === "string"))
  node_env = (process.env.NODE_ENV as string)?.toLowerCase();

let environment = environments.development;

if (typeof environments[node_env] === "object")
  environment = environments[node_env];

export default environment;
