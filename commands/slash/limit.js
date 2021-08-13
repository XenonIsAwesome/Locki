const { interactionReply } = require("../../util");

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

        if (client.lockiRooms[c_id].owner !== interaction.member.user.id) {
            return interactionReply(client, interaction, {
                content: 'Only the owner of the room can do that.',
                flags: 1<<6
            });
        }

        c = client.fetch(interaction.guild_id).then(g => {
            return await g.channels.fetch(client.lockiMembers[interaction.member.user.id]);
        });

        const amount = 0;
        if (args.amount) {
            amount = args.amount.value;
        }

        c.setUserLimit(amount);

        return interactionReply(client, interaction, {
            content: `Limited the amount of users to ${amount}.`,
            flags: 1<<6
        });
    }
}