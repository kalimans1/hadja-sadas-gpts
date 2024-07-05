// @ts-check

const { Schema, model } = require("mongoose");

const botSchema = new Schema({
  clientId: String,
  whitelist: { type: Array, default: [] },
  autoJoin: { type: Array, default: [] },
  autoRoles: { type: Array, default: [] },
  autoMessage: { type: Array, default: [] },
  authorizedServers: { type: Array, default: [] },
});

module.exports = model("bots", botSchema);
