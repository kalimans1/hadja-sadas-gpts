// @ts-check

const { Client } = require("discord.js");
const { slashCommands } = require("../Utils/client");
const { error } = require("../Utils/logger");

/**
 * @param {import("discord.js").Interaction} interaction
 * @param {Client<true>} client
 */
module.exports = async (interaction, client) => {
  if (!interaction.isChatInputCommand()) return;

  const command = slashCommands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (e) {
    error(e);
  }
};
