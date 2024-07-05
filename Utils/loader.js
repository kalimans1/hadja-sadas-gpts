// @ts-check

const fs = require("fs");
const chalk = require("chalk");

/* Core API */
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

/* Core Config */
const config = require("../Settings/config");
const { Client } = require("discord.js");
const { error, log, warn } = require("./logger");
const { slashCommands } = require("./client");

/* Core API Configuration */
const rest = new REST({ version: "10" }).setToken(config.token);

/**
 * @param {Client} client
 */
module.exports = function (client) {
  const commandFiles = fs
    .readdirSync("./Commands")
    .filter((file) => file.endsWith(".js"));
  log(`InteractionContent Loading...`);
  const commands = [];

  for (const file of commandFiles) {
    try {
      const command = require(`../Commands/${file}`);
      if (command.data) {
        slashCommands.set(command.data.name, command);
        log(
          `Slash Command loaded ${chalk.green(
            command.data.name
          )} Command Enabled`
        );
        commands.push(command.data.toJSON());
      } else {
        warn(`${file} is missing data`);
      }
    } catch (err) {
      warn(`Error loading ${file}: ${err}`);
    }
  }

  const requestEvent = (event) => require(`../Events/${event}`);
  client.on("interactionCreate", (interactionCreate) =>
    requestEvent("interactionHandler")(interactionCreate, client)
  );
  client.on("interactionCreate", (interactionCreate) =>
    requestEvent("interactionCreate")(interactionCreate, client)
  );
  client.on("interactionCreate", (interactionCreate) =>
    requestEvent("interactionCreateII")(interactionCreate, client)
  );
  client.on("interactionCreate", (interactionCreate) =>
    requestEvent("interactionModal")(interactionCreate, client)
  );

  client.on("ready", async (client) => {
    log(`Successfully logged in as: ${client.user.tag} ${client.user.id}`);

    /* Core Create Database */
    const botSchema = require("../Schema/botSchema");
    const data = await botSchema.findOne({ clientId: client.user.id });

    if (!data) {
      const newData = {
        clientId: client.user.id,
        wihtelist: [],
        autoJoin: [],
        autoRoles: [],
        autoMessage: [],
        authorizedServers: [],
      };

      await new botSchema(newData).save();
    }

    /* Core Interacion Loader */
    try {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
    } catch (e) {
      error(e);
    }
  });
};
