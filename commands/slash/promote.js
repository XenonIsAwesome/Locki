const { promote, interactionReply } = require("../../util");

module.exports = {
    structure: {
        data: {
            name: 'promote',
            description: 'Promote a member in the room',
            options: [
                {
                  type: 9,
                  name: "member",
                  description: "A member to promote in the room",
                  required: true
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

        if (!client.lockiRooms[c_id].members.includes(args.member.value)) {
            return interactionReply(client, interaction, {
                content: `<@!${args.member.value}> isn't in the room.`,
                flags: 1<<6
            });
        }

        promote(client, interaction, args.member.value, c_id);
        return interactionReply(client, interaction, {
            content: `Promoted <@!${args.member.value}> to be owner.`,
            flags: 1<<6
        });
    }
}