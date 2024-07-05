// @ts-check

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  OAuth2Scopes,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} = require("discord.js");
const config = require("../Settings/config");
let array = [];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("about")
    .setNameLocalizations({ tr: "hakkimda", fr: "environ" })
    .setDescription("Display information about the bot.")
    .setDescriptionLocalizations({
      tr: "Botla ilgili bilgileri görüntüleyin.",
      fr: "Afficher des informations sur le bot.",
    }),
  enabled: true,
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client<true>} client
   */
  async execute(interaction, client) {
    config.authDevelopers.forEach(async (x) => {
      await client.users.fetch(x).then((t) => {
        return array.push(t.username, t.discriminator);
      });
    });
    let btn = new ButtonBuilder()
      .setStyle(5)
      .setURL(
        client.generateInvite({
          scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
        })
      )
      .setLabel("Add bot")
      .setEmoji("🤖");
    let btn2 = new ButtonBuilder()
      .setStyle(5)
      .setURL(config.client.serverLink)
      .setLabel("Join support")
      .setEmoji("❓");
    const row = new ActionRowBuilder().addComponents([btn, btn2]);
    let embed = new EmbedBuilder()
      .setTitle("💯 About")
      .setDescription(`Made In Doktor`);
    await interaction.reply({
      ephemeral: true,
      components: [row],
      embeds: [embed],
    });
  },
};
