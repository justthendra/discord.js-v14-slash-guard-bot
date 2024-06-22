const { Events, ActivityType } = require('discord.js')
const config = require('../config.json');
require('cute-logs')
const mongoose = require('mongoose')

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {

        client.user.setStatus(config.bot.presence.status);
        client.user.setPresence({
            activities: [{
                name: config.bot.presence.text,
                type: ActivityType.Listening
            }]
        })

        mongoose.connect(config.bot.mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.success("MongoDB Bağlantısı Başarılı.", "MongoDB");
        }).catch(err => {
            console.error("MongoDB Bağlantısı Başarısız: " + err, "MongoDB");
        })

        console.success(client.user.username + " sunucuyu korumaya hazır!", "Bot");
    }
}