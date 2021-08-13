const { promote } = require("../../util");

module.exports = {
    structure: {
        data: {
            name: 'promote',
            description: 'promote a member in the room',
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

        return promote(client, interaction, args.member.value)
    }
}