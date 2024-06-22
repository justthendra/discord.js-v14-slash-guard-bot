const mongoose = require('mongoose');

const linkData = new mongoose.Schema({
    guildId: { type: String, required: true },
    isEnabled: { type: Boolean, default: false },
    exemptRoles: { type: [String], default: [] }
});

module.exports = mongoose.model('Antilink', linkData)