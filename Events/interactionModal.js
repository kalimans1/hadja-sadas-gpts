// @ts-check

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  StringSelectMenuBuilder,
} = require("discord.js");
const { authClient } = require("../Utils/client");

const botSchema = require("../Schema/botSchema");
const config = require("../Settings/config");

/**
 * @param {Client<true>} client
 * @param {import("discord.js").Interaction} interaction
 */

module.exports = async (interaction, client) => {
  /* Core Interaction */

  /* Core Interaction Modal */
  if (!interaction.isModalSubmit()) return;

  let rowyId = interaction.customId;

  /* Core Whitelist Add Modal */
  if (rowyId === "addWhitelistModal") {
    /* Core Whitelist Interaction Value */
    const ID = interaction.fields
      .getTextInputValue("addWhitelistModalText")
      .replace(/\s+/g, "");

    /* Core API Not Found */
    if (!ID || isNaN(ID))
      return interaction.reply({
        content:
          ":x:" + interaction.locale == "tr"
            ? "`` Lütfen geçerli bir ID girin. ``"
            : interaction.locale == "fr"
            ? "`` Veuillez entrer un ID valide. ``"
            : "`` Please enter a valid ID. ``",
        ephemeral: true,
      });

    /* Core API Fetch */
    const x = await authClient.fetchUser(ID);

    /* Core Whitelist Add Modal Database */
    const checkData = await botSchema.findOne({ clientId: client.user.id });

    if (checkData?.whitelist?.find((x) => x.id === ID))
      return interaction.reply({
        content:
          interaction.locale == "tr"
            ? ":x: `` Bu kullanıcı zaten beyaz listede. ``"
            : interaction.locale == "fr"
            ? ":x: `` Cet utilisateur est déjà sur la liste blanche. ``"
            : ":x: `` This user is already on the white list. ``",
        ephemeral: true,
      });

    /* Core Whitelist Added */
    await botSchema.findOneAndUpdate(
      { clientId: client.user.id },
      {
        $push: {
          whitelist: { name: x?.username + "#" + x?.discriminator, id: ID },
        },
      },
      { upsert: true }
    );

    /* Core Whitelist Interaction Update */
    const data = await botSchema.findOne({ clientId: client.user.id });
    data.whitelist = data.whitelist.reverse();

    /* Core Whitelist Page */
    let page = 0;
    let maxPage = Math.ceil(data.whitelist?.length / 5);

    /* Core Whitelist Interaction Page Update */
    let slicedData = data.whitelist.slice(page * 5, (page + 1) * 5);

    let embed = new EmbedBuilder()
      .setTitle(
        interaction.locale == "tr"
          ? "AuthClient - Beyaz Liste"
          : interaction.locale == "fr"
          ? "AuthClient - Liste blanche"
          : "AuthClient - Whitelist"
      )
      .setDescription(
        `${
          data.whitelist?.length > 0
            ? slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1} \` \` ${value.name} \` - \` ${value.id} \``
                )
                .join("\n")
            : interaction.locale == "tr"
            ? "`` Beyazliste boş görünüyor. ``"
            : interaction.locale == "fr"
            ? "`` La liste blanche semble vide. ``"
            : "`` The white list looks empty. ``"
        }`
      )
      .setFooter({
        text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
      });

    /* Core Whitelist Builder */

    let menu1 = new StringSelectMenuBuilder()
      .setCustomId("menu1")
      .setPlaceholder(
        interaction.locale == "tr"
          ? "🔨 Bir seçenek seçin"
          : interaction.locale == "fr"
          ? "🔨 Sélectionnez une option"
          : "🔨 Select an option"
      )
      .addOptions(
        {
          label:
            interaction.locale == "tr"
              ? "Gelişmiş Panel"
              : interaction.locale == "fr"
              ? "Paramètres Avancés"
              : "Advanced Panel",
          description:
            interaction.locale == "tr"
              ? "Bot için gelişmiş panel."
              : interaction.locale == "fr"
              ? "Paramètres avancés pour le bot."
              : "Advanced panel for the bot.",
          value: "advancedsettings",
          emoji: "⚒️",
        },
        {
          label:
            interaction.locale == "tr"
              ? "Kullanıcıları Girdir"
              : interaction.locale == "fr"
              ? "Rejoindre des Utilisateurs"
              : "Join Users",
          description:
            interaction.locale == "tr"
              ? "Kullanıcıları sunucuya davet eder. (Sadece yetkili sunucular)"
              : interaction.locale == "fr"
              ? "Invitez des utilisateurs sur le serveur. (Serveurs autorisés uniquement)"
              : "Invite users to the server. (Just authorized servers)",
          value: "joinusers",
          emoji: "🧑‍🚀",
        },
        {
          label:
            interaction.locale == "tr"
              ? "Beyazliste"
              : interaction.locale == "fr"
              ? "Gérer la liste blanche"
              : "Manage whitelist",
          description:
            interaction.locale == "tr"
              ? "Botu kullanmasına izin verilen beyaz listeye alınmış üyelerin listesini görüntüler."
              : interaction.locale == "fr"
              ? "Affiche la liste des membres de la liste blanche autorisés à utiliser le bot."
              : "Displays the list of whitelisted members allow to use the bot.",
          value: "manageWhitelist",
          emoji: "🥷",
        },
        {
          label:
            interaction.locale == "tr"
              ? "Kullanıcılara bak"
              : interaction.locale == "fr"
              ? "Regardez les utilisateurs"
              : "Look at users",
          description:
            interaction.locale == "tr"
              ? "Doğrulanmış ve kimliği doğrulanmış kullanıcıların tam listesini görüntüler."
              : interaction.locale == "fr"
              ? "Affiche la liste complète des utilisateurs vérifiés et authentifiés."
              : "Displays the complete list of verified and authenticated users.",
          value: "manageusers",
          emoji: "🍧",
        }
      );

    const row2 = new ActionRowBuilder().addComponents(menu1);

    let row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel(
          interaction.locale == "tr"
            ? "Ekle"
            : interaction.locale == "fr"
            ? "Ajouter"
            : "Add"
        )
        .setCustomId("addWhitelist"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(
          interaction.locale == "tr"
            ? "Çıkar"
            : interaction.locale == "fr"
            ? "Bénéfice"
            : "Remove"
        )
        .setCustomId("removeWhitelist")
    );

    let row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("◀")
        .setCustomId("previousPage2")
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("▶")
        .setCustomId("nextPage2")
        .setDisabled(page === maxPage - 1),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel(
          interaction.locale == "tr"
            ? "Ekle"
            : interaction.locale == "fr"
            ? "Ajouter"
            : "Add"
        )
        .setCustomId("addWhitelist"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(
          interaction.locale == "tr"
            ? "Çıkar"
            : interaction.locale == "fr"
            ? "Bénéfice"
            : "Remove"
        )
        .setCustomId("removeWhitelist")
    );

    /* Core Whitelist Message */
    let whitelist = [];
    if (data.whitelist?.length > 5) whitelist = [row3, row2];
    else whitelist = [row, row2];

    await interaction
      .update({ embeds: [embed], components: whitelist })
      .then(async (msg) => {
        var iFilter = (x) => x.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({
          filter: iFilter,
          componentType: 2,
          time: 60 * 1000,
        });
        collector.on("collect", async (interac) => {
          if (interac.customId == "nextPage2") {
            page++;
            slicedData = data.whitelist.slice(page * 5, (page + 1) * 5);
            embed.setDescription(
              slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1 + page * 5} \` \` ${value.name} \` - \` ${
                      value.id
                    } \``
                )
                .join("\n")
            );
            embed.setFooter({
              text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
            });
            row3.components[0].setDisabled(page === 0);
            row3.components[1].setDisabled(page === maxPage - 1);
            await interac
              .update({ embeds: [embed], components: whitelist })
              .catch((err) => {});
          } else if (interac.customId == "previousPage2") {
            page--;
            slicedData = data.whitelist.slice(page * 5, (page + 1) * 5);
            embed.setDescription(
              slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1 + page * 5} \` \` ${value.name} \` - \` ${
                      value.id
                    } \``
                )
                .join("\n")
            );
            embed.setFooter({
              text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
            });
            row3.components[0].setDisabled(page === 0);
            row3.components[1].setDisabled(page === maxPage - 1);
            await interac
              .update({ embeds: [embed], components: whitelist })
              .catch((err) => {});
          }

          collector.on("end", async () => {
            row3.components[0].setDisabled(true);
            row3.components[1].setDisabled(true);
          });
        });
      });

    await interaction.followUp({
      content: `${
        interaction.locale == "tr"
          ? "✅ Başarıyla eklendi."
          : interaction.locale == "fr"
          ? "✅ Ajouté avec succès."
          : "✅ Successfully added."
      } (\` ${x.username}#${x.discriminator} \`)`,
      ephemeral: true,
    });
  }

  /* Core Whitelist Remove Modal */
  if (rowyId === "removeWhitelistModal") {
    /* Core Whitelist Interaction Value */
    let ID = interaction.fields.getTextInputValue("removeWhitelistModalText");
    ID = ID.replace(/\s+/g, "");

    /* Core API Not Found */
    if (!ID || isNaN(ID))
      return interaction.reply({
        content:
          interaction.locale == "tr"
            ? ":x: `` Lütfen geçerli bir ID girin. ``"
            : interaction.locale == "fr"
            ? ":x: `` Veuillez entrer un ID valide. ``"
            : ":x: `` Please enter a valid ID. ``",
        ephemeral: true,
      });

    /* Core Whitelist Add Modal Database */
    let checkData = await botSchema.findOne({ clientId: client.user.id });
    if (!checkData.whitelist?.find((x) => x.id === ID))
      return interaction.reply({
        content:
          interaction.locale == "tr"
            ? ":x: `` Bu kullanıcı zaten beyazlistede değil. ``"
            : interaction.locale == "fr"
            ? ":x: `` Cet utilisateur n'est pas déjà sur la liste blanche. ``"
            : ":x: `` This user is not already on the white list. ``",
        ephemeral: true,
      });

    /* Core API Fetch */
    const x = await authClient.fetchUser(ID);

    /* Core Whitelist Removed */
    await botSchema.findOneAndUpdate(
      { clientId: client.user.id },
      {
        $pull: {
          whitelist: { name: x.username + "#" + x.discriminator, id: ID },
        },
      },
      { upsert: true }
    );

    /* Core Whitelist Interaction Update */
    let data = await botSchema.findOne({ clientId: client.user.id });
    data.whitelist = data.whitelist.reverse();

    /* Core Whitelist Page */
    let page = 0;
    let maxPage = Math.ceil(data.whitelist?.length / 5);

    /* Core Whitelist Interaction Page Update */
    let slicedData = data.whitelist.slice(page * 5, (page + 1) * 5);

    let embed = new EmbedBuilder()
      .setTitle(
        interaction.locale == "tr"
          ? "AuthClient - Beyaz Liste"
          : interaction.locale == "fr"
          ? "AuthClient - Liste blanche"
          : "AuthClient - Whitelist"
      )
      .setDescription(
        `${
          data.whitelist?.length > 0
            ? slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1} \` \` ${value.name} \` - \` ${value.id} \``
                )
                .join("\n")
            : interaction.locale == "tr"
            ? "`` Beyazliste boş görünüyor. ``"
            : interaction.locale == "fr"
            ? "`` La liste blanche semble vide. ``"
            : "`` The white list looks empty. ``"
        }`
      )
      .setFooter({
        text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
      });

    /* Core Whitelist Buttons */
    let row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel(
          interaction.locale == "tr"
            ? "Ekle"
            : interaction.locale == "fr"
            ? "Ajouter"
            : "Add"
        )
        .setCustomId("addWhitelist"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(
          interaction.locale == "tr"
            ? "Çıkar"
            : interaction.locale == "fr"
            ? "Bénéfice"
            : "Remove"
        )
        .setCustomId("removeWhitelist")
    );

    let row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("◀")
        .setCustomId("previousPage1")
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setLabel("▶")
        .setCustomId("nextPage1")
        .setDisabled(page === maxPage - 1),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel(
          interaction.locale == "tr"
            ? "Ekle"
            : interaction.locale == "fr"
            ? "Ajouter"
            : "Add"
        )
        .setCustomId("addWhitelist"),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel(
          interaction.locale == "tr"
            ? "Çıkar"
            : interaction.locale == "fr"
            ? "Bénéfice"
            : "Remove"
        )
        .setCustomId("removeWhitelist")
    );

    /* Core Whitelist Message */
    await interaction
      .update({
        embeds: [embed],
        components: [data.whitelist?.length > 5 ? row3 : row],
      })
      .then(async (msg) => {
        var iFilter = (x) => x.user.id === interaction.user.id;
        const collector = msg.createMessageComponentCollector({
          filter: iFilter,
          componentType: 2,
        });
        collector.on("collect", async (interac) => {
          if (interac.customId == "nextPage1") {
            page++;
            slicedData = data.whitelist.slice(page * 5, (page + 1) * 5);
            embed.setDescription(
              slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1 + page * 5} \` \` ${value.name} \` - \` ${
                      value.id
                    } \``
                )
                .join("\n")
            );
            embed.setFooter({
              text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
            });
            row3.components[0].setDisabled(page === 0);
            row3.components[1].setDisabled(page === maxPage - 1);
            await interac
              .update({
                embeds: [embed],
                components: [data.whitelist?.length > 5 ? row3 : row],
              })
              .catch((err) => {});
          } else if (interac.customId == "previousPage1") {
            page--;
            slicedData = data.whitelist.slice(page * 5, (page + 1) * 5);
            embed.setDescription(
              slicedData
                ?.map(
                  (value, index) =>
                    `\` ${index + 1 + page * 5} \` \` ${value.name} \` - \` ${
                      value.id
                    } \``
                )
                .join("\n")
            );
            embed.setFooter({
              text: `${config.client.footer} | Page ${page + 1} of ${maxPage}`,
            });
            row3.components[0].setDisabled(page === 0);
            row3.components[1].setDisabled(page === maxPage - 1);
            await interac
              .update({
                embeds: [embed],
                components: [data.whitelist?.length > 5 ? row3 : row],
              })
              .catch((err) => {});
          }

          collector.on("end", async () => {
            row3.components[0].setDisabled(true);
            row3.components[1].setDisabled(true);
          });
        });
      });
    await interaction.followUp({
      content: `${
        interaction.locale == "tr"
          ? "✅ Başarıyla çıkartıldı."
          : interaction.locale == "fr"
          ? "✅ Supprimé avec succès"
          : "✅ Successfully removed."
      } (\` ${x.username}#${x.discriminator} \`)`,
      ephemeral: true,
    });
  }

  /* Core Menu Row - Advanced panel */
  let advancedpanel = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("advancedsettingsmenuupdate")
      .setPlaceholder(
        interaction.locale == "tr"
          ? "🔨 Bir seçenek seçin"
          : interaction.locale == "fr"
          ? "🔨 Sélectionnez une option"
          : "🔨 Select an option"
      )
      .addOptions({
        label:
          interaction.locale == "tr"
            ? "Yetkili Sunucular"
            : interaction.locale == "fr"
            ? "Serveurs Autorisés"
            : "Authorized Servers",
        description:
          interaction.locale == "tr"
            ? "Bot için yetkili sunucular."
            : interaction.locale == "fr"
            ? "Serveurs autorisés pour le bot."
            : "Authorized servers for the bot.",
        value: "authorizedservers",
        emoji: "📂",
      })
  );

  /* Core Authorized Server Add Modals */
  if (rowyId == "addGuildModals") {
    let checkData = await botSchema.findOne({ clientId: client.user.id });

    let ID = interaction.fields.getTextInputValue("guildIds");
    ID = ID.replace(/\s+/g, "");
    if (isNaN(ID))
      return await interaction.reply({
        content: `${
          interaction.locale == "tr"
            ? "⚠ Lütfen geçerli bir sunucu id gir"
            : interaction.locale == "fr"
            ? "⚠ Veuillez entrer un identifiant de serveur valide"
            : `⚠ Please enter a valid server id.`
        }`,
        ephemeral: true,
      });

    let embed2 = new EmbedBuilder()
      .setColor("2F3136")
      .setTitle(
        `${
          interaction.locale == "tr"
            ? "🆕 Sunucu Ekle"
            : interaction.locale == "fr"
            ? "🆕 Ajouter un serveur"
            : "🆕 Add Server"
        }`
      )
      .setDescription(
        interaction.locale == "tr"
          ? `Söz konusu sunucuda değilim lütfen beni eklemek için aşağıdaki bağlantıyı kullanın -> [Bu bağlantıya tıkla!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}"&permissions=8&scope=bot&guild_id=${ID}&disable_guild_select=truepm)`
          : interaction.locale == "fr"
          ? `Je ne suis pas sur le serveur mentionné, veuillez utiliser ce lien ci-dessous pour m'ajouter -> [Cliquez sur ce lien!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}"&permissions=8&scope=bot&guild_id=${ID}&disable_guild_select=truepm)`
          : `Im not in the mentioned server please use this link below to add me -> [Use this link below to add server!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}"&permissions=8&scope=bot&guild_id=${ID}&disable_guild_select=truepm)\n \`\`\`Bu bağlantıya tıkla!](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}"&permissions=8&scope=bot&guild_id=${ID}&disable_guild_select=truepm\`\`\``
      );

    let array = [];
    if (!client.guilds.cache.get(ID)) array = [embed2];
    else array = [];
    if (checkData.authorizedServers?.includes(ID))
      return await interaction.reply({
        content: `${
          interaction.locale == "tr"
            ? "⚠ Bu sunucu zaten yetkilendirilmiş."
            : interaction.locale == "fr"
            ? "⚠ Ce serveur est déjà autorisé."
            : `⚠ This server is already authorized.`
        }`,
        embeds: array,
        ephemeral: true,
      });

    await botSchema.findOneAndUpdate(
      { clientId: client.user.id },
      { $push: { authorizedServers: ID } },
      { upsert: true }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("authorizedserversadd")
        .setLabel(
          interaction.locale == "tr"
            ? "Ekle"
            : interaction.locale == "fr"
            ? "Ajouter"
            : "Add"
        )
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("authorizedserversremove")
        .setLabel(
          interaction.locale == "tr"
            ? "Kaldır"
            : interaction.locale == "fr"
            ? "Retirer"
            : "Remove"
        )
        .setStyle(ButtonStyle.Danger)
    );

    let checkData2 = await botSchema.findOne({ clientId: client.user.id });

    const embed = new EmbedBuilder()
      .setTitle(
        interaction.locale == "tr"
          ? "AuthClient - Yetkili Sunucular"
          : interaction.locale == "fr"
          ? "AuthClient - Serveurs Autorisés"
          : "AuthClient - Authorized Servers"
      )
      .setDescription(
        `${
          checkData2?.authorizedServers.length > 0
            ? checkData2?.authorizedServers
                .map(
                  (value, index) =>
                    `\` ${index + 1} \` \` ${
                      client.guilds.cache.get(value)?.name
                        ? client.guilds.cache.get(value)?.name
                        : "Unknown Server"
                    } \` - \` ${value} \``
                )
                .join("\n")
            : interaction.locale == "tr"
            ? "``Yetkili sunucu yok.``"
            : interaction.locale == "fr"
            ? "``Il n'y a pas de serveur autorisé.``"
            : "``No authorized server was found.``vvvvvvvvvvvvvvvvvvvvvvvvvvvv"
        }`
      )
      .setFooter({ text: `${config.client.footer}` });

    await interaction.update({
      embeds: [embed],
      components: [row, global.advancedpanel],
      ephemeral: true,
    });

    interaction.followUp({
      content: `${
        interaction.locale == "tr"
          ? "⚠️ Sunucu beyaz listeye eklendi, şimdi aşağıdaki bağlantıyla ekleyebilirsiniz"
          : interaction.locale == "fr"
          ? "⚠️ Serveur La guilde a été ajoutée dans la liste blanche, vous pouvez maintenant l'ajouter avec le lien ci-dessous"
          : "⚠️ Guild has been added in the whitelist, you can now add it with the link below"
      }`,
      embeds: [
        new EmbedBuilder()
          .setColor("2F3136")
          .setDescription(
            "🆕 **New Guild Added**\n\n[Use this link below to add server](https://discord.com/api/oauth2/authorize?client_id=" +
              client.user.id +
              "&permissions=8&scope=bot&guild_id=" +
              ID +
              "&disable_guild_select=truepm)\n```https://discord.com/api/oauth2/authorize?client_id=" +
              client.user.id +
              "&permissions=8&scope=bot&guild_id=" +
              ID +
              "&disable_guild_select=truepm```"
          ),
      ],
      ephemeral: true,
    });
  }

  /* Core Authorized Server Remove Modals */
  if (rowyId == "removeGuildModals") {
    let checkData = await botSchema.findOne({ clientId: client.user.id });

    let ID = interaction.fields.getTextInputValue("guildIds");
    ID = ID.replace(/\s+/g, "");
    if (isNaN(ID))
      return await interaction.reply({
        content: `${
          interaction.locale == "tr"
            ? "⚠ Lütfen geçerli bir sunucu id gir"
            : interaction.locale == "fr"
            ? "⚠ Veuillez entrer un identifiant de serveur valide"
            : `⚠ Please enter a valid server id.`
        }`,
        ephemeral: true,
      });
    if (!checkData.authorizedServers?.includes(ID))
      return await interaction.reply({
        content: `${
          interaction.locale == "tr"
            ? "⚠ Bu sunucu zaten botun yetkili sunucularında bulunmuyor."
            : interaction.locale == "fr"
            ? "⚠ Ce serveur n'est pas déjà dans les serveurs autorisés du bot."
            : `⚠ This server is not already in the bot's authorized servers.`
        }`,
        ephemeral: true,
      });

    await botSchema.findOneAndUpdate(
      { clientId: client.user.id },
      { $pull: { authorizedServers: ID } },
      { upsert: true }
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("authorizedserversadd")
        .setLabel(
          interaction.locale == "tr"
            ? "Ekle"
            : interaction.locale == "fr"
            ? "Ajouter"
            : "Add"
        )
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("authorizedserversremove")
        .setLabel(
          interaction.locale == "tr"
            ? "Kaldır"
            : interaction.locale == "fr"
            ? "Retirer"
            : "Remove"
        )
        .setStyle(ButtonStyle.Danger)
    );

    let checkData2 = await botSchema.findOne({ clientId: client.user.id });

    const embed = new EmbedBuilder()
      .setTitle(
        interaction.locale == "tr"
          ? "AuthClient - Yetkili Sunucular"
          : interaction.locale == "fr"
          ? "AuthClient - Serveurs Autorisés"
          : "AuthClient - Authorized Servers"
      )
      .setDescription(
        `${
          checkData2?.authorizedServers.length > 0
            ? checkData2?.authorizedServers
                .map(
                  (value, index) =>
                    `\` ${index + 1} \` \` ${
                      client.guilds.cache.get(value)?.name
                        ? client.guilds.cache.get(value)?.name
                        : "Unknown Server"
                    } \` - \` ${value} \``
                )
                .join("\n")
            : interaction.locale == "tr"
            ? "``Yetkili sunucu yok.``"
            : interaction.locale == "fr"
            ? "``Il n'y a pas de serveur autorisé.``"
            : "``No authorized server was found.``"
        }`
      )
      .setFooter({ text: `${config.client.footer}` });

    await interaction.update({
      embeds: [embed],
      components: [row, global.advancedpanel],
      ephemeral: true,
    });

    await interaction.followUp({
      content: `${
        interaction.locale == "tr"
          ? "⚠️ Yetkili sunucu beyaz listeden kaldırıldı, Eğer bot bu sunucudaysa 5 saniye içinde otomatik olarak çıkış yapacak."
          : interaction.locale == "fr"
          ? "⚠️ Serveur La guilde a été supprimée de la liste blanche, Si le bot est sur ce serveur, il se déconnectera automatiquement dans les 5 secondes."
          : "⚠️ Guild has been removed in the whitelist, If the bot is on this server it will log out automatically within 5 seconds."
      }`,
      ephemeral: true,
    });

    if (client.guilds.cache.get(ID)) {
      setTimeout(function () {
        client.guilds.cache.get(ID).leave();
      }, 5 * 1000);
    }
  }
};
