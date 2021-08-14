const fs = require('fs');
const { Collection } = require('discord.js');
const { getApp } = require('./util.js');


async function initCommands(client) {
    // initiation of normal commands
    client.commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }
}


async function initSlash(client, guildId, initiateAll) {
    // fetching existing slash commands from discord api
    const slashCommands = await getApp(client, guildId).commands.get();

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
}


async function initComponent(client) {
    // initiation of component commands
    client.componentCommands = new Collection();
    const componentCommandFiles = fs.readdirSync('./commands/component/').filter(file => file.endsWith('.js'));
        
    for (const file of componentCommandFiles) {
        const cmd = require(`./commands/component/${file}`);
        client.componentCommands.set(cmd.name, cmd);
    }
}

async function initEvents(client) {
    // initiation of events
    const eventFiles = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));
        
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.name, (...args) => event.execute(client, ...args));
        }
    }
}


async function initWSEvents(client) {
    // initiation of ws events
    const wsEventFiles = fs.readdirSync('./events/ws/').filter(file => file.endsWith('.js'));
        
    for (const file of wsEventFiles) {
        const event = require(`./events/ws/${file}`);
        if (event.once) {
            client.ws.once(event.name, (...args) => event.execute(client, ...args));
        } else {
            client.ws.on(event.name, (...args) => event.execute(client, ...args));
        }
    }
}

module.exports = {
    initCommands,
    initSlash,
    initComponent,
    initEvents,
    initWSEvents
}