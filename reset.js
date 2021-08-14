const { getApp } = require('./util.js')

const Discord = require('discord.js');
const client = new Discord.Client({ ws: { intents: 'GUILD_MEMBERS' }});
require('dotenv').config();

client.once('ready', async () => {
    console.info(`Logged in as ${client.user.username}#${client.user.discriminator}`);
    
    await getApp(client, process.env.GUILD).commands.get().then(async(commands) => {
        for (const c of commands) {
            await getApp(client, process.env.GUILD).commands(c.id).delete();
            console.log(`[slash] removed ${c.name}`);
        }

        console.info('DONE');
    });
});

client.login(process.env.TOKEN);