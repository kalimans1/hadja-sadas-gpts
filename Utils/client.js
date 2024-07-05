// @ts-check

const { Client, Collection } = require("discord.js");
const client = new Client({ intents: [3276799] });
const config = require("../Settings/config");
const AuthClient = require("../Core/AuthClient");

const slashCommands = new Collection();
const newCollection = new Collection();
const authLink = `https://discord.com/oauth2/authorize?client_id=${config.client.id}&redirect_uri=${config.client.redirect_uri}&response_type=code&scope=identify%20guilds.join`;
const authClient = new AuthClient(client);

module.exports = {
  client,
  slashCommands,
  newCollection,
  authLink,
  authClient,
};
