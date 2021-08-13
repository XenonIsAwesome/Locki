require('dotenv').config()

const { getApp, parseArgs, interactionReply, genRandCode, promote } = require('./util.js');

const guildId = '775372142396571678';

const { Client, Collection, Permissions } = require('discord.js');
const client = new Client({ ws: { intents: 'GUILD_MEMBERS' }});

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

    client.lockiRooms = {};
    client.lockiMembers = {};
    client.lockiGuilds = {};

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


client.on('voiceStateUpdate', (oldM, newM) => {
    if(newM.voice.channelId === client.lockiGuilds[newM.voice.guild.id].channel) {
        // User joins a voice channel
        const code = genRandCode();
        
        const ownerRole = await newM.voice.guild.roles.create({
            color: 'GOLD',
            name: `[ 👑 ] ${code}`
        });

        const normalRole = await newM.voice.guild.roles.create({
            name: `[ 🔑 ] ${code}`
        });

        const channel = await newM.voice.guild.channels.create({
            name: `[ 🔒 ] ${code}`,
            options: {
                type: 'voice',
                permissionOverwrites: [
                    {
                        id: ownerRole.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: normalRole.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: guild.id,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                    }
                ],
                parent: client.lockiGuilds[newM.voice.guild.id].parent
            }
        });

        client.lockiRooms[`${newM.voice.guild.id}/${newM.voice.channelId}`] = {
            ownerRole: ownerRole.id,
            normalRole: normalRole.id,
            channel: channel.id,

            owner: newM.id,
            members: [newM.id]
        };
        client.members[channel.id] = [newM.id];

        newM.voice.setChannel(channel);
    } else {
        // User leaves a voice channel
        if (client.lockiMembers[oldM.id]) {
            c_id = `${oldM.voice.guild.id}/${oldM.voice.channelId}`
            delete client.lockiMembers[oldM.id];

            if (oldM.voice.channel.lockiMembers.length <= 0) {
                const oRole = client.lockiRooms[c_id].ownerRole;
                const nRole = client.lockiRooms[c_id].normalRole;

                client.guilds.fetch(oldM.voice.guild.id).then(g => {
                    g.roles.remove(oRole);
                    g.roles.remove(nRole);
                });

                oldM.voice.channel.delete();
                delete client.lockiRooms[c_id];
            } else if (oldM.id === client.lockiRooms[c_id].owner) {
                // promote random user
                const rndMem = client.lockiRooms[c_id].members[Math.floor(Math.random() * client.lockiRooms[c_id]
                    .members.length)];
                
                promote(client, {
                    member: { user: {id: oldM.id } },
                    guild_id: oldM.voice.guild.id
                }, rndMem);
            }
        }
    }
 });


client.on('guildCreate', guild => {
    parent = guild.channels.create('[ 🔒 ] Locki Channels', {
        type: 'category'
    });

    channel = guild.channels.create('🔒 Join to create a room', {
        type: 'voice',
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [Permissions.FLAGS.SPEAK]
            }
        ],
        parent: parent
    });

    client.lockiGuilds[guild.id] = {
        parent: parent.id,
        channel: channel.id
    };
})

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
