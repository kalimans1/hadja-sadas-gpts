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
    id: "1216103189116616834",
    secret: process.env.SECRET ?? "no-secret",
    redirect_uri: "https://auth-bot-8tas.onrender.com/auth",
    scope: ["identify", "guilds.join"],
    footer: "AuthBot v1.0.0",
    serverLink: "https://discord.gg/49aqUBvQV4",
  },
  web: {
    port: 319,
    apiKey: process.env.API_KEY ?? "no-key",
  },
  database: {
    URI: process.env.MONGO ?? "no-mongo",
  },
};
