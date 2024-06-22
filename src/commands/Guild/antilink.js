const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('antilink')
    .setDescription('Anti-link korumasını yapılandırın')
    .addSubcommand(subcommand =>
        subcommand.setName('durum')
        .setDescription('Anti-link korumasını aç veya kapat')
    .addStringOption(option =>
        option.setName('durum')
        .setDescription('Anti-link modunu aç veya kapat')
        .setRequired(true)
        .addChoices(
            { name: 'Aç', value: 'on' },
            { name: 'Kapat', value: 'off' }
        )))
        .addSubcommand(subcommand =>
            subcommand.setName('istisna')
            .setDescription('Bağlantı göndermesine izin verilen rolleri yapılandırın')
        .addRoleOption(option =>
            option.setName('rol')
            .setDescription('Muaf tutulacak rolü seçin')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('aksiyon')
            .setDescription('Rolü ekle veya kaldır')
            .setRequired(true)
            .addChoices(
                { name: 'Ekle', value: 'add' },
                { name: 'Kaldır', value: 'remove' }
        ))),
    async execute(interaction) {

        const AntiLink = require('../../models/antilink')

        const subcommand = interaction.options.getSubcommand();
        let antiLinkSetting = await AntiLink.findOne({ guildId: interaction.guild.id });

        if (!antiLinkSetting) {
            antiLinkSetting = new AntiLink({ guildId: interaction.guild.id });
        }

        if (subcommand === 'durum') {
            const status = interaction.options.getString('durum');

            if (status === 'on') {
                antiLinkSetting.isEnabled = true;
                await antiLinkSetting.save();
                const emb = new EmbedBuilder()
                .setTitle('Discord.js v14 Guard Bot')
                .setColor(config.embeds.colorSuccessfull)
                .setAuthor({name: "Anti-Link Sistemi."})
                .setDescription(`Anti-Link modu \`aktif\` hale getirildi.`)
                .setTimestamp()
                .setFooter({text: "Discord.js v14 Guard Bot | Anti-Link", iconURL: interaction.client.user.displayAvatarURL()})
                interaction.reply({embeds: [emb]})
            } else if (status === 'off') {
                antiLinkSetting.isEnabled = false;
                await antiLinkSetting.save();
                const emb = new EmbedBuilder()
                .setTitle('Discord.js v14 Guard Bot')
                .setColor(config.embeds.colorSuccessfull)
                .setAuthor({name: "Anti-Link Sistemi."})
                .setDescription(`Anti-Link modu \`de-aktif\` hale getirildi.`)
                .setTimestamp()
                .setFooter({text: "Discord.js v14 Guard Bot | Anti-Link", iconURL: interaction.client.user.displayAvatarURL()})
                interaction.reply({embeds: [emb]})
            }
        } else if (subcommand === 'istisna') {
            const role = interaction.options.getRole('rol');
            const action = interaction.options.getString('aksiyon');

            if (action === 'add') {
                if (!antiLinkSetting.exemptRoles.includes(role.id)) {
                    antiLinkSetting.exemptRoles.push(role.id);
                    await antiLinkSetting.save();
                    return interaction.reply(`Rol **${role.name}** bağlantı göndermeden muaf tutuldu.`);
                } else {
                    return interaction.reply(`Rol **${role.name}** zaten muaf durumda.`);
                }
            } else if (action === 'remove') {
                if (antiLinkSetting.exemptRoles.includes(role.id)) {
                    antiLinkSetting.exemptRoles = antiLinkSetting.exemptRoles.filter(id => id !== role.id);
                    await antiLinkSetting.save();
                    return interaction.reply(`Rol **${role.name}** artık muaf değil.`);
                } else {
                    return interaction.reply(`Rol **${role.name}** zaten muaf durumda değil.`);
                }
            }
        }
    }
}