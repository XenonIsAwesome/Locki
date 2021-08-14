const { genRandCode, promote } = require('../util.js');
const { Permissions } = require('discord.js')

module.exports = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(client, oldState, newState) {
        c_id = `${oldState.guild.id}/${oldState.channelID}`;

        if (client.lockiRooms[c_id]) {
            const oRole = client.lockiRooms[c_id].ownerRole;
            const nRole = client.lockiRooms[c_id].normalRole;

            delete client.lockiMembers[oldState.member.id];
            oldState.member.roles.remove(oRole);
            oldState.member.roles.remove(nRole);

            if (oldState.channel.members.size <= 0) {
                client.guilds.fetch(oldState.guild.id).then(g => {
                    g.roles.fetch(oRole).then(r => r.delete());
                    g.roles.fetch(nRole).then(r => r.delete());
                });

                oldState.channel.delete();
                delete client.lockiRooms[c_id];
            } else if (oldState.member.id === client.lockiRooms[c_id].owner) {
                // promote random user
                const rndMem = client.lockiRooms[c_id].members[Math.floor(Math.random() * client.lockiRooms[c_id]
                    .members.length)];
                
                promote(client, {
                    member: { user: {id: oldState.member.id } },
                    guild_id: oldState.guild.id
                }, rndMem);
            }
        }

        if(newState.channelID === client.db.get(newState.guild.id).channel) {
            // User joins a voice channel
            let code = ''
            do {
                code = genRandCode();
            } while (Object.values(client.lockiRooms).find(r => r.code == code));
            
            const ownerRole = await newState.guild.roles.create({
                data: {
                    name: `[👑] ${code}`,
                    color: 'GOLD'
                }
            }).catch(console.error);

            const normalRole = await newState.guild.roles.create({
                data: {
                    name: `[🔑] ${code}`
                }
            });
    
            const channel = await newState.guild.channels.create(`[🔒] ${code}`, {
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
                        id: newState.guild.id,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                    }
                ],
                parent: client.db.get(newState.guild.id).parent
            });
    
            client.lockiRooms[`${newState.guild.id}/${channel.id}`] = {
                code: code,

                ownerRole: ownerRole.id,
                normalRole: normalRole.id,
                channel: channel.id,
    
                owner: newState.member.id,
                members: [newState.member.id]
            };

            newState.setChannel(channel);
            newState.member.roles.add(ownerRole);

            client.lockiMembers[newState.member.id] = channel.id;
        }
    }
}