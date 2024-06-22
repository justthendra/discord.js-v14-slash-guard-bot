const mongoose = require('mongoose');

const spamData = new mongoose.Schema({
    guildId: { type: String, required: true },
    threshold: { type: Number, default: 5 }, // Belirli bir süre içinde izin verilen maksimum mesaj sayısı
    timeout: { type: Number, default: 10000 }, // Milisaniye cinsinden spam kontrol süresi
    muteDuration: { type: Number, default: 60000 } // Milisaniye cinsinden susturma süresi
});

module.exports = mongoose.model('Antispam', spamData)