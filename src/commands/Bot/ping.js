const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Botun gecikmesini görüntülersiniz.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {

        interaction.reply({content: `Pingim: \`${interaction.client.ws.ping}\`ms`})
    }
}