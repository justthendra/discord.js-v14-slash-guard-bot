const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('rol-koruma')
    .setDescription('Rol korumasını yapılandırın')
    .addSubcommand(subcommand =>
        subcommand.setName('durum')
        .setDescription('Rol korumasını aç veya kapat')
    .addStringOption(option =>
        option.setName('durum')
        .setDescription('Rol koruma modunu aç veya kapat')
        .setRequired(true)
        .addChoices(
            { name: 'Aç', value: 'on' },
            { name: 'Kapat', value: 'off' }
        ))),
    async execute(interaction) {

        const Role = require('../../models/role')

        const subcommand = interaction.options.getSubcommand();
        let roleGuardSetting = await Role.findOne({ guildId: interaction.guild.id });

        if (!roleGuardSetting) {
            roleGuardSetting = new Role({ guildId: interaction.guild.id });
        }

        if (subcommand === 'durum') {
            const status = interaction.options.getString('durum');

            if (status === 'on') {
                roleGuardSetting.isEnabled = true;
                await roleGuardSetting.save();
                const emb = new EmbedBuilder()
                .setTitle('Discord.js v14 Guard Bot')
                .setColor(config.embeds.colorSuccessfull)
                .setAuthor({name: "Rol Koruma Sistemi."})
                .setDescription(`Rol Koruma modu \`aktif\` hale getirildi.`)
                .setTimestamp()
                .setFooter({text: "Discord.js v14 Guard Bot | Rol Koruma", iconURL: interaction.client.user.displayAvatarURL()})
                interaction.reply({embeds: [emb]})
            } else if (status === 'off') {
                roleGuardSetting.isEnabled = false;
                await roleGuardSetting.save();
                const emb = new EmbedBuilder()
                .setTitle('Discord.js v14 Guard Bot')
                .setColor(config.embeds.colorSuccessfull)
                .setAuthor({name: "Rol Koruma Sistemi."})
                .setDescription(`Rol Koruma modu \`de-aktif\` hale getirildi.`)
                .setTimestamp()
                .setFooter({text: "Discord.js v14 Guard Bot | Rol Koruma", iconURL: interaction.client.user.displayAvatarURL()})
                interaction.reply({embeds: [emb]})
            }
        }
    }
}