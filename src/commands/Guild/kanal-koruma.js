const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kanal-koruma')
    .setDescription('Kanal korumasını yapılandırın')
    .addSubcommand(subcommand =>
        subcommand.setName('durum')
        .setDescription('Kanal korumasını aç veya kapat')
    .addStringOption(option =>
        option.setName('durum')
        .setDescription('Kanal koruma modunu aç veya kapat')
        .setRequired(true)
        .addChoices(
            { name: 'Aç', value: 'on' },
            { name: 'Kapat', value: 'off' }
        ))),
    async execute(interaction) {

        const Channel = require('../../models/channelGuard')

        const subcommand = interaction.options.getSubcommand();
        let channelGuardSetting = await Channel.findOne({ guildId: interaction.guild.id });

        if (!channelGuardSetting) {
            channelGuardSetting = new Channel({ guildId: interaction.guild.id });
        }

        if (subcommand === 'durum') {
            const status = interaction.options.getString('durum');

            if (status === 'on') {
                channelGuardSetting.isEnabled = true;
                await channelGuardSetting.save();
                const emb = new EmbedBuilder()
                .setTitle('Discord.js v14 Guard Bot')
                .setColor(config.embeds.colorSuccessfull)
                .setAuthor({name: "Kanal Koruma Sistemi."})
                .setDescription(`Kanal Koruma modu \`aktif\` hale getirildi.`)
                .setTimestamp()
                .setFooter({text: "Discord.js v14 Guard Bot | Kanal Koruma", iconURL: interaction.client.user.displayAvatarURL()})
                interaction.reply({embeds: [emb]})
            } else if (status === 'off') {
                channelGuardSetting.isEnabled = false;
                await channelGuardSetting.save();
                const emb = new EmbedBuilder()
                .setTitle('Discord.js v14 Guard Bot')
                .setColor(config.embeds.colorSuccessfull)
                .setAuthor({name: "Kanal Koruma Sistemi."})
                .setDescription(`Kanal Koruma modu \`de-aktif\` hale getirildi.`)
                .setTimestamp()
                .setFooter({text: "Discord.js v14 Guard Bot | Kanal Koruma", iconURL: interaction.client.user.displayAvatarURL()})
                interaction.reply({embeds: [emb]})
            }
        }
    }
}