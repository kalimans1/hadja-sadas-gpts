// @ts-check

const userSchema = require("../Schema/userSchema");
const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const { authClient } = require("../Utils/client");
const { error } = require("../Utils/logger");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh the access token for all users."),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const refreshInterval = 5; // Refresh interval in seconds

    // Send initial message stating the start of the refresh
    const initialMessage = await interaction.reply("Starting token refresh...");

    const users = await userSchema
      .find({})
      .lean()
      .select("_id refreshToken expiresDate");
    let count = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        let refreshed = await authClient.refreshToken(user.refreshToken);
        if (refreshed) {
          count++;
        }
      } catch (e) {
        // Handle the error here
        error(`Error refreshing token for user: ${user._id}`, e);
        errorCount++;

        // Remove user from the list if refresh token is invalid or expired
        await userSchema.findOneAndDelete({ _id: user._id });
      }

      const progressMessage = `Refreshing access tokens: ${count} out of ${users.length} users.`;
      await initialMessage.edit(progressMessage);
      await new Promise((resolve) =>
        setTimeout(resolve, refreshInterval * 1000)
      ); // Wait for the specified interval
    }

    const message =
      count > 0
        ? `Refreshed access tokens for ${count} out of ${users.length} users.`
        : `No access tokens needed to be refreshed.`;

    // Edit the initial message with the final result
    await initialMessage.edit(
      `${message} ${errorCount} users encountered errors during token refresh.`
    );
  },
};
