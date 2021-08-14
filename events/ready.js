const { /* initCommands ,*/ initSlash, /* initComponent, */ initWSEvents } = require('../init.js');
const JSONdb = require('simple-json-db');
const { Permissions } = require('discord.js');


module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        // initCommands(client);
        initSlash(client, process.env.GUILD, false);
        // initComponent(client);
        initWSEvents(client);

        client.db = new JSONdb('guilds.json', { asyncWrite: true, syncOnWrite: true });
        client.db.sync();

        client.lockiRooms = {};
        client.lockiMembers = {};

        /*
        const guilds = client.guilds.cache;
        guilds.map((g, _) => {
            if (!client.db.has(g.id)) {
                require('./guildCreate.js').execute(client, g);
            } else {
                const dbGuild = client.db.get(g.id);

                let parent = null;
                let channel = null;

                if (!g.channels.cache.find((s, _) => s === dbGuild.parent)) {
                    parent = g.channels.create('[ 🔒 ] Locki Channels', {
                        type: 'category'
                    });
                }

                if (!g.channels.cache.find((s, _) => s === dbGuild.channel)) {
                    channel = g.channels.create('🔒 Join to create a room', {
                        type: 'voice',
                        permissionOverwrites: [
                            {
                                id: g.id,
                                deny: [Permissions.FLAGS.SPEAK]
                            }
                        ],
                        parent: parent
                    });
                }

                client.db.set(g.id, {
                    parent: parent.id,
                    channel: channel.id
                });
            }
        });

        client.db.sync();

        const json = Object.keys(client.db.JSON());
        for (const g of json) {
            require('./guildDelete.js').execute(client, g);
        }

        client.db.sync();
        */

        console.info(`Ready and logged in as ${client.user.tag}!`);
    }
}