const { Permissions } = require('discord.js');

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute(client, guild) {
        parent = await guild.channels.create('[ 🔒 ] Locki Channels', {
            type: 'category'
        });
    
        channel = await guild.channels.create('🔒 Join to create a room', {
            type: 'voice',
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [Permissions.FLAGS.SPEAK]
                }
            ],
            parent: parent
        });
    
        client.db.set(guild.id, {
            parent: parent.id,
            channel: channel.id
        });
    }
}