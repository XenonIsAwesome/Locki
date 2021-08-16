const { Permissions } = require('discord.js');

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(client, guild) {
        const parent = await guild.channels.create('[ 🔒 ] Locki Channels', {
            type: 'category'
        });
    
        const channel = await guild.channels.create('🔒 Join to create a room', {
            type: 'voice',
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [Permissions.FLAGS.SPEAK]
                }
            ],
            parent: parent
        });
    
        client.db.guilds.update(
            { guildId: guild.id },
            { 
                $set: {
                    parent: parent.id,
                    channel: channel.id
                }
            },
            { upsert: true }
        );
    }
}