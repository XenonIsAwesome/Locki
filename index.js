require('dotenv').config()

const { getApp, parseArgs, interactionReply } = require('./util.js');

const guildId = '775372142396571678';

const { Client, Collection } = require('discord.js');
const client = new Discord.Client({ ws: { intents: 'GUILD_MEMBERS' }});

const fs = require('fs');


client.on('ready', async () => {
    // fetching existing slash commands from discord api
    const slashCommands = await getApp(client, guildId).commands.get();

    // initiation of normal commands
    client.commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }

    // initiation of slash commands
    client.slashCommands = new Collection();
    const slashCommandFiles = fs.readdirSync('./commands/slash').filter(file => file.endsWith('.js'));
    
    for (const file of slashCommandFiles) {
        const cmd = require(`./commands/slash/${file}`);
        client.slashCommands.set(cmd.structure.data.name, cmd);

        if (cmd.structure.data.notcommand) { continue; }
        if (initiateAll || !slashCommands.map(c => c.name).includes(cmd.structure.data.name)) {
            await getApp(client, guildId).commands.post(cmd.structure);
            console.info(`[slash] initiated ${cmd.structure.data.name}`);
        }
        else { console.info(`[slash] skipped over ${cmd.structure.data.name}`); }
    }

    // initiation of component commands
    client.componentCommands = new Collection();
    const componentCommandFiles = fs.readdirSync('./commands/component/').filter(file => file.endsWith('.js'));
        
    for (const file of componentCommandFiles) {
        const cmd = require(`./commands/component/${file}`);
        client.componentCommands.set(cmd.structure.data.name, cmd);

        if (cmd.structure.data.notcommand) { continue; }
        if (initiateAll || !slashCommands.map(c => c.name).includes(cmd.structure.data.name)) {
            await getApp(client, guildId).commands.post(cmd.structure);
            console.info(`[component] initiated ${cmd.structure.data.name}`);
        }
        else { console.info(`[component] skipped over ${cmd.structure.data.name}`); }
    }

    client.lockiChats = {};
    client.lockiMembers = {};

    console.info(`Ready and logged in as ${client.user.tag}!`);
});


// normal commands
client.on('message', msg => {
    if (!msg.content.startsWith(process.env.PREFIX) || msg.author.bot) return;

    const cArgs = msg.content.slice(process.env.PREFIX.length).trim().split(/ +/);
    const cName = cArgs.shift().toLowerCase();

    if (!client.commands.has(cName)) return;

    try {
        client.commands.get(cName).execute(client, msg, cArgs);
    } catch (error) {
        console.error(error);
        msg.reply(`There was an error trying to execute that command!\n**${error}**`);
    }
});


// slash and component commands
client.ws.on('INTERACTION_CREATE', async(interaction) => {
    if (interaction.data.name) {
        try {
            await client.slashCommands.get(interaction.data.name).execute(client, interaction, parseArgs(interaction.data.options));
        } catch (error) {
            console.error(error);
            interactionReply(client, interaction, {
                content: error,
                flags: 1 << 6
            });
        }
    } else if (interaction.data.custom_id) {
        const name = interaction.data.custom_id.split('.')[0];
        const args = JSON.parse(interaction.data.custom_id.split('.')[1]);

        try {
            await client.componentCommands.get(name).execute(client, interaction, args, whitelist);
        } catch (error) {
            console.error(error);
            interactionReply(client, interaction, {
                content: error,
                flags: 1 << 6
            });
        }
    }
});


client.login(process.env.TOKEN);
