const { interactionReply } = require('../../util.js');
  
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

        if (client.lockiRooms[c_id].members.includes(args.member.value)) {
            return interactionReply(client, interaction, {
                content: `<@!${args.member.value}> is already in the room.`,
                flags: 1<<6
            });
        }

        const g = await client.guilds.fetch(interaction.guild_id);
        const u = await g.members.fetch(args.member.value);

        client.lockiRooms[c_id].members.push(args.member.value);
        
        const roleId = client.lockiRooms[c_id].normalRole;
        u.roles.add(roleId);

        return interactionReply(client, interaction, {
            content: `Added <@!${u.id}> to the room.`,
            flags: 1<<6
        });
    }
}