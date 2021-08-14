const { interactionReply } = require('../../util.js');

module.exports = {
    structure: {
        data: {
            name: 'remove',
            description: 'Remove a member from the room',
            options: [
                {
                  type: 9,
                  name: "member",
                  description: "A member to remove from the room",
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

        const g = await client.guilds.fetch(interaction.guild_id);
        const u = await g.members.fetch(args.member.value);
        
        const normalRoleId = client.lockiRooms[c_id].normalRole;

        u.roles.remove(normalRoleId);

        return interactionReply(client, interaction, {
            content: `Removed <@!${u.id}> from the room.`,
            flags: 1<<6
        });
    }
}