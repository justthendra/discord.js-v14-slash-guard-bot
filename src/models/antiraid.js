const mongoose = require('mongoose');

const raidData = new mongoose.Schema({
    guildId: { type: String },
    isEnabled: { type: String, default: false }
});

module.exports = mongoose.model('Antiraid', raidData);