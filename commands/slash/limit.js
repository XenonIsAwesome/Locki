const { interactionReply } = require("../../util.js");

module.exports = {
    structure: {
        data: {
            name: 'limit',
            description: 'Limits the amount of people that can enter a room',
            options: [
                {
                  type: 4,
                  name: "amount",
                  description: "Amount of people that can enter the room",
                  required: false
                }
            ]
        }
    },
    async execute(client, interaction, args) {
        const c_id = `${interaction.guild_id}/${client.lockiMembers[interaction.member.user.id]}`

        if (!client.lockiRooms[c_id]) {
            return interactionReply(client, interaction, {
                content: 'You are not in a room.',
                flags: 1<<6
            });
        }
        
        if (client.lockiRooms[c_id].owner !== interaction.member.user.id) {
            return interactionReply(client, interaction, {
                content: 'Only the owner of the room can do that.',
                flags: 1<<6
            });
        }

        const c = await client.guilds.fetch(interaction.guild_id,).then(async (g) => {
            return await g.channels.cache.get(client.lockiMembers[interaction.member.user.id]);
        });

        let amount = 0;
        if (args.amount) {
            amount = Math.min(Math.max(args.amount.value, 0), 99);
        }
        
        c.setUserLimit(amount).then(_ => {
            return interactionReply(client, interaction, {
                content: `Limited the amount of users to ${amount}.`,
                flags: 1<<6
            });
        }).catch(console.error);
    }
}