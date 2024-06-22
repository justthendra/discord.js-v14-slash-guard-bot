const { Client, Partials, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const config = require('./config.json');
require('cute-logs')

const client = new Client({
    intents: [ GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [ Partials.Channel, Partials.GuildMember, Partials.Message, Partials.User ]
})

const fs = require('node:fs');
const path = require('node:path')

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.error(`[UYARI] ${filePath} isimli komut "data" veya "execute" tanımı içermediği için çalıştırılamadı.`, "Komutlar");
		}
	}
}

const { REST, Routes } = require('discord.js');


const commands = [];

for (const folder of commandFolders) {
	
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.error(`[UYARI] ${filePath} isimli komut "data" veya "execute" tanımı içermediği için çalıştırılamadı.`, "Komutlar");
		}
	}
}

const rest = new REST().setToken(config.bot.token);

(async () => {
	try {
		console.info(`${commands.length} adet entegrasyon komutu (/) yenileniyor.`, "Komutlar");

		
		const data = await rest.put(
			Routes.applicationCommands(config.bot.client_id),
			{ body: commands },
		);

		console.info(`${commands.length} adet entegrasyon komutu (/) yenileniyor.`, "Komutlar");
	} catch (error) {
		
		console.error(error);
	}
})();

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

module.exports = client;


// Anti-Raid Sistemi

const AntiRaid = require('./models/antiraid');
const recentJoins = {};

client.on('guildMemberAdd', async member => {
	const antiRaidSettings = await AntiRaid.findOne({ guildId: member.guild.id });

	if (antiRaidSettings && antiRaidSettings.isEnabled) {
		const now = Date.now()
		const joins = recentJoins[member.guild.id] || [];

		joins.push(now);
		recentJoins[member.guild.id] = joins.filter(joinTime = now - joinTime < 60000);

		if (recentJoins[member.guild.id].length > 5) {
            const banList = recentJoins[member.guild.id];
            recentJoins[member.guild.id] = [];

            member.guild.systemChannel.send('Anti-raid koruması devrede: 1 dakika içinde fazla sayıda kullanıcı katıldığı için banlanacaklar.');

            for (const joinTime of banList) {
                const userId = member.guild.members.cache.find(m => m.joinedTimestamp === joinTime)?.id;
                if (userId) {
                    try {
                        await member.guild.members.ban(userId, { reason: 'Anti-raid koruması' });
                    } catch (err) {
                        console.error(`Kullanıcı ${userId} banlanırken hata oluştu:` + err, "Hata");
                    }
                }
            }
        }
	}
})

//*

// Anti-Spam Sistemi

const AntiSpam = require('./models/antispam');

const userMessages = new Map();

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const spamSettings = await AntiSpam.findOne({ guildId: message.guild.id });

    if (!spamSettings) return;

    const { threshold, timeout, muteDuration } = spamSettings;

    if (!userMessages.has(message.author.id)) {
        userMessages.set(message.author.id, []);
    }

    const now = Date.now();
    const timestamps = userMessages.get(message.author.id);

    timestamps.push(now);

    const recentMessages = timestamps.filter(timestamp => now - timestamp < timeout);
    userMessages.set(message.author.id, recentMessages);

    if (recentMessages.length >= threshold) {
        const member = message.guild.members.cache.get(message.author.id);

        if (member) {
            member.timeout(muteDuration, "Spam yaptığı için zaman aşımı uygulandı.")
            message.channel.send(`${message.author} spam yaptığı için zaman aşımı uygulandı.`);
        }
        userMessages.set(message.author.id, []);
    }
});

//*

// Anti-link Sistemi

const AntiLink = require('./models/antilink')

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const antiLinkSetting = await AntiLink.findOne({ guildId: message.guild.id });

    if (antiLinkSetting && antiLinkSetting.isEnabled) {
        const exemptRoles = antiLinkSetting.exemptRoles;

        if (message.member.roles.cache.some(role => exemptRoles.includes(role.id))) {
            return; 
        }

        const linkRegex = /https?:\/\/[^\s]+/g;

        if (linkRegex.test(message.content)) {
            message.delete().catch(console.error);
        }
    }
});

//*

// Rol Koruma Sistemi

const RoleGuard = require('./models/role')

client.on('roleDelete', async role => {

    const roleGuardSetting = await RoleGuard.findOne({ guildId: role.guild.id });
    

    if (roleGuardSetting && roleGuardSetting.isEnabled) {

        try {
            const guild = role.guild;
    
            const membersWithRole = role.members.map(member => member.id);
    
            const newRoleData = await RoleGuard.findOneAndUpdate({
                guildId: guild.id,
                roleId: role.id,
                roleName: role.name,
                roleColor: role.hexColor,
                roleHoist: role.hoist,
                rolePermissions: role.permissions.bitfield,
                roleMentionable: role.mentionable,
                members: membersWithRole
            });
    
            await newRoleData.save();
            console.log(`Rol ${role.name} MongoDB'ye kaydedildi.`);
    
            const newRole = await guild.roles.create({
                name: role.name,
                color: role.color,
                hoist: role.hoist,
                permissions: role.permissions,
                mentionable: role.mentionable,
                reason: 'Rol yeniden oluşturuldu çünkü silindi'
            });
    
            console.log(`Rol ${newRole.name} oluşturuldu.`);
            const embed = new EmbedBuilder()
            .setAuthor({name: "Bir rol silindi ve geri oluşturdum."})
            .setTitle("Discord.js V14 Guard Bot")
            .setDescription(`${newRole} isimli rol silindi. Rolü geri oluşturdum ve role sahip kişilere verdim.`)
            .setColor("Random")
            .setFooter({text: "Discord.js v14 Guard Bot | Rol Koruma", iconURL: client.user.displayAvatarURL()})
            .setTimestamp()
            .setURL("https://github.com/justthendra/discord.js-v14-slash-guard-bot")

            const channell = config.guild.mod;
            const logChannel = client.channels.cache.find(cha => cha.id === channell)
            logChannel.send({embeds: [embed]})

            await guild.members.fetch();
            for (const memberId of membersWithRole) {
                const member = guild.members.cache.get(memberId);
                if (member) {
                    await member.roles.add(newRole, 'Silinen rol geri eklendi');
                    console.log(`Yeni rol ${newRole.name} kullanıcılara geri verildi.`);
                }
            await RoleGuard.deleteOne({ guildId: guild.id, roleId: role.id });
            }
    
        } catch (error) {
            console.error('Rol yeniden oluşturulurken bir hata oluştu:', error);
        }
    }
})

//*

// Rol Koruma Sistemi

const channelGuardSettings = require('./models/channelGuard');

client.on('channelDelete', async channel => {

    const newChannelData = await channelGuardSettings.findOneAndUpdate({
        guildId: channel.guild.id,
        channelId: channel.id,
        channelName: channel.name,
        channelType: channel.type,
        parentId: channel.parentId,
        position: channel.position,
    });

    if (channelGuardSettings && channelGuardSettings.isEnabled) {

        try {
        
            const newChannel = await channel.guild.channels.create(newChannelData.channelName, {
                type: newChannelData.channelType,
                parent: newChannelData.parentId,
                position: newChannelData.position,
                reason: 'Koruma altındaki kanal yeniden oluşturuldu'
            });

            console.log(`Kanal ${newChannel.name} yeniden oluşturuldu.`);

            const embed = new EmbedBuilder()
            .setAuthor({name: "Bir kanal silindi ve kanalı geri oluşturdum."})
            .setTitle("Discord.js V14 Guard Bot")
            .setDescription(`${newChannel} isimli kanal silindi. Kanalı geri oluşturdum.`)
            .setColor("Random")
            .setFooter({text: "Discord.js v14 Guard Bot | Kanal Koruma", iconURL: client.user.displayAvatarURL()})
            .setTimestamp()
            .setURL("https://github.com/justthendra/discord.js-v14-slash-guard-bot")

            const channell = config.guild.mod;
            const logChannel = client.channels.cache.find(cha => cha.id === channell)
            logChannel.send({embeds: [embed]})
        } catch (err) {
            consolo.log(`Kanal oluşturalamadı hata: ${err}`)
        }

}
});

//*

process.on('unhandledRejection', (reason, p) => {
    console.log(reason, p);
});

process.on('uncaughtException', (err, origin) => {
    console.log(err, origin);
})

client.login(config.bot.token)