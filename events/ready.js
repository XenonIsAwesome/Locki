const { initSlash, initWSEvents } = require('../init.js');
const Datastore = require('nedb');
const { Permissions } = require('discord.js');


module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        initSlash(client, process.env.GUILD, false);
        initWSEvents(client);

        client.db = {};
        client.db.guilds = new Datastore({ filename: 'guilds.db', autoload: true });

        client.lockiRooms = {};
        client.lockiMembers = {};

        
        const guilds = client.guilds.cache;
        guilds.map((g, _) => {
            client.db.guilds.findOne({ 'guildId': g.id }, (err, dbGuild) => {
                if (dbGuild === null) {
                    require('./guildCreate.js').execute(client, g);
                }
            });
        });

        client.db.guilds.find({}, (err, docs) => {
            for (const g of docs) {
                if (!guilds.find((_, s) => { return s === g.guildId } )) {
                    require('./guildDelete.js').execute(client, { id: g.guildId });
                }
            }
        });
        
        console.info(`Ready and logged in as ${client.user.tag}!`);
    }
}