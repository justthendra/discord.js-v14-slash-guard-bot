const mongoose = require('mongoose');

const roleData = new mongoose.Schema({
    guildId: { type: String },
    roleId: { type: String },
    roleName: { type: String },
    roleColor: { type: String },
    roleHoist: { type: Boolean },
    rolePermissions: { type: BigInt },
    roleMentionable: { type: Boolean },
    members: [String],
    isEnabled: { type: String, default: false }
});

module.exports = mongoose.model('RoleGuard', roleData);