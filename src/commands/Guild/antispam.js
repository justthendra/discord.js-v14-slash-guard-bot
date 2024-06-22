const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const AntiSpam = require('../../models/antispam');
const config = require('../../config.json')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('antispam')
    .setDescription('Anti-spam korumasını yapılandırın')
    .addSubcommand(subcommand =>
        subcommand.setName('ayar')
        .setDescription('Anti-spam ayarlarını yapılandırın')
    .addIntegerOption(option => 
        option.setName('sınır')
        .setDescription('Spam sınırı (belirli bir süre içinde izin verilen maksimum mesaj sayısı)')
        .setRequired(true))
    .addIntegerOption(option => 
        option.setName('süre')
        .setDescription('Spam kontrol süresi (milisaniye)')
        .setRequired(true))
    .addIntegerOption(option => 
        option.setName('susturmasüresi')
        .setDescription('Spam tespit edildiğinde kullanıcıyı susturma süresi (milisaniye)')
        .setRequired(true))),
    async execute(interaction) {

        const threshold = interaction.options.getInteger('sınır');
        const timeout = interaction.options.getInteger('süre');
        const muteDuration = interaction.options.getInteger('susturmasüresi');

        const antiSpamSettings = await AntiSpam.findOne({ guildId: interaction.guild.id })

        if (!antiSpamSettings) {
            new AntiSpam({
                guildId: interaction.guild.id,
                threshold: threshold,
                timeout: timeout,
                muteDuration: muteDuration
            }).save();
        } else {
            await AntiSpam.findOneAndUpdate({
                guildId: interaction.guild.id,
                threshold: threshold,
                timeout: timeout,
                muteDuration: muteDuration
            });
        }

        const emb = new EmbedBuilder()
        .setTitle('Discord.js v14 Guard Bot')
        .setColor(config.embeds.colorSuccessfull)
        .setAuthor({name: "Anti-spam Sistemi."})
        .setDescription(`Anti-spam modu \`aktif\` hale getirildi. Ayarlar aşağıda göründüğü gibidir.\n\nSınır: ${threshold}\nSüre: ${timeout}\nSusturma Süresi: ${muteDuration}ms`)
        .setTimestamp()
        .setFooter({text: "Discord.js v14 Guard Bot | Anti-spam", iconURL: interaction.client.user.displayAvatarURL()})
        interaction.reply({embeds: [emb]})
    
        }
}