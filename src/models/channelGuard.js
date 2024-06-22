const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    guildId: { type: String },
    channelId: { type: String },
    channelName: { type: String },
    channelType: { type: String },
    parentId: { type: String },
    position: { type: Number },
    isEnabled: { type: String, default: false } 
});

module.exports = mongoose.model('ChannelGuard', channelSchema);