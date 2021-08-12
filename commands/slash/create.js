const { genRandCode, channelExists } = require('../util/misc.js')

module.exports = {
    structure: {
        data: {
            name: "create",
            description: "Creates a chat room"
        }    
    },
    async execute(client, interaction, args, members, chats) {
        g = await client.guilds.fetch(interaction.guild_id);
        u = await g.members.fetch(interaction.member.user.id);

        chatId = members[u.id]?.split('/')?.reverse()[0];
        if (chatId) { 
            client.api.interactions(interaction.id,interaction.token)
                .callback.post({
                    data: {
                        type: 4,
                        data: { 
                            content: `You are already in room \`${chatId}\`
Please leave it or remove it.`, 
                            flags: 1<<6
                        }
                    }
                })
            return;
        }

        do {
            code = genRandCode();
        } while (channelExists(code, g.channels.cache))

        ownerRole = await g.roles.create({
            data: {
                name: `[👑] ${code}`,
                color: 'GOLD'
            }
        }).catch(console.error)

        normalRole = await g.roles.create({
            data: {
                name: `[🔑] ${code}`,
            }
        }).catch(console.error)

        category = await g.channels.create(`⎯⎯ [🔓] ${code} ⎯⎯`, { 
            type: 'category'
        }).catch(console.error)
        
        t = await g.channels.create('text', { 
            type: 'text', 
            parent: category 
        });

        t.setTopic('🔓 Unlocked');
        
        v = await g.channels.create('Voice', { 
            type: 'voice', 
            parent: category 
        });
        
        await u.roles.add(ownerRole);

        members[u.id] = `${g.id}/${code}`;
        chats[`${g.id}/${code}`] = {
            owner: u.id,
            members: [u.id],
            locked: false
        }

        client.api.interactions(interaction.id,interaction.token)
            .callback.post({
                data: {
                    type: 4,
                    data: { 
                        content: `Created the chat ${code}`,
                        flags: 1<<6
                    }
                }
            })

    }
}