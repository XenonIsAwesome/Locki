  module.exports = {
    structure: {
        data: {
            name: 'add',
            description: 'Add a member to participate in the room',
            options: [
                {
                  type: 9,
                  name: "member",
                  description: "A member to participate in the room",
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

        const g = await client.guilds.fetch(interaction.guild_id);
        const u = await g.users.fetch(args.member.value);

        client.lockiRooms[c_id].members.push(args.member.value);
        
        const roleId = client.lockiRooms[c_id].normalRole;
        u.roles.add(roleId);

        return interactionReply(client, interaction, {
            content: `Added ${u.user.tag} to the room.`,
            flags: 1<<6
        });
    }
}