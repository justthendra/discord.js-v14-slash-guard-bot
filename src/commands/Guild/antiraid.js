const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const AntiRaid = require('../../models/antiraid')
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('antiraid')
    .setDescription('Anti-raid korumasını aç veya kapat.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
        option.setName('durum')
        .setDescription('Anti-raid modunu aç veya kapat.')
        .setRequired(true)
        .addChoices(
            { name: "Aç", value: "on"},
            { name: "Kapat", value: "off"}
        )),
    async execute(interaction) {
    
    const status = interaction.options.getString('durum');

    const antiRaidSettings = await AntiRaid.findOne({ guildId: interaction.guild.id })

    if (!antiRaidSettings) {
        antiRaidSettings = new AntiRaid({ guildId: interaction.guild.id });
    }

    if (status === 'on') {
        antiRaidSettings.isEnabled = true;
        await antiRaidSettings.save();
        const emb = new EmbedBuilder()
        .setTitle('Discord.js v14 Guard Bot')
        .setColor(config.embeds.colorSuccessfull)
        .setAuthor({name: "Anti-raid Sistemi."})
        .setDescription(`Anti-raid modu \`aktif\` hale getirildi.`)
        .setTimestamp()
        .setFooter({text: "Discord.js v14 Guard Bot | Anti-raid", iconURL: interaction.client.user.displayAvatarURL()})
        interaction.reply({embeds: [emb]})

    } else if(status === 'off') {
        antiRaidSettings.isEnabled = false;
        await antiRaidSettings.save();
        const emb = new EmbedBuilder()
        .setTitle('Discord.js v14 Guard Bot')
        .setColor(config.embeds.colorSuccessfull)
        .setAuthor({name: "Anti-raid Sistemi."})
        .setDescription(`Anti-raid modu \`de-aktif\` hale getirildi.`)
        .setTimestamp()
        .setFooter({text: "Discord.js v14 Guard Bot | Anti-raid", iconURL: interaction.client.user.displayAvatarURL()})
        interaction.reply({embeds: [emb]})
    }

    }
}