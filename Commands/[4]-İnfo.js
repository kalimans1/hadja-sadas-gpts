// @ts-check

const {
  EmbedBuilder,
  codeBlock,
  ActionRowBuilder,
  ButtonBuilder,
  OAuth2Scopes,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} = require("discord.js");
const config = require("../Settings/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setNameLocalizations({ tr: "bilgi", fr: "info" })
    .setDescription("Display the bot's statistics.")
    .setDescriptionLocalizations({
      tr: "Botun istatistiklerini görüntüleyin.",
      fr: "Affichez les statistiques du bot.",
    }),
  enabled: true,
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client<true>} client
   */
  async execute(interaction, client) {
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
    let embed = new EmbedBuilder().setTitle("📈 Statistics").addFields(
      {
        name: "Servers",
        value: `${codeBlock("fix", `[ ${client.guilds.cache.size} ]`)}`,
        inline: true,
      },
      {
        name: "Members",
        value: `${codeBlock("fix", `[ ${client.users.cache.size} ]`)}`,
        inline: true,
      }
    );

    await interaction.reply({
      ephemeral: true,
      components: [row],
      embeds: [embed],
    });
  },
};
