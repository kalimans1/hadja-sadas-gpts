// @ts-check

require("dotenv").config();

module.exports = {
  token: process.env.TOKEN ?? "no-token",
  authDevelopers: ["1214250364597960775"],
  authOwners: ["1214250364597960775"],
  webhook: {
    name: "AuthBot",
    avatar: "",
    url: process.env.WEBHOOK ?? "no-webhook",
  },
  guild: {
    id: "1214280471496892516",
    role: "1214280471496892516",
  },
  client: {
    id: "",
    secret: process.env.SECRET ?? "no-secret",
    redirect_uri: "https://site/auth",
    scope: ["identify", "guilds.join"],
    footer: "AuthBot v1.0.0",
    serverLink: "https://discord.gg/altyapilar",
  },
  web: {
    port: 319,
    apiKey: process.env.API_KEY ?? "no-key",
  },
  database: {
    URI: process.env.MONGO ?? "no-mongo",
  },
};
