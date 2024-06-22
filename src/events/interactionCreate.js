const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if(!command) {
            console.error(`${interaction.commandName} ismiyle eşleşen bir komut bulamadım.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.referred) {
                await interaction.followUp({ content: 'Komut çalıştırılırken bir hata oldu!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Komut çalıştırılırken bir hata oldu!', ephemeral: true });
            }
        }
    },
};