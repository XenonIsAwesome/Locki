const { interactionReply } = require('../../util.js');
  
module.exports = {
    structure: {
        data: {
            name: 'setup',
            description: 'Setup the bot to work in the server.',
        }
    },
    async execute(client, interaction, args) {
        const g = await client.guilds.fetch(interaction.guild_id); 
        const u = await g.members.fetch(interaction.member.user.id);

        if (u.hasPermission('MANAGE_MESSAGES')) {
            require('../../events/guildCreate').execute(client, g);
            interactionReply(client, interaction, {
                content: 'Set-up the server!',
                flags: 1<<6 
            });
        } else {
            interactionReply(client, interaction, {
                content: 'You can\'t use this command',
                flags: 1<<6 
            });
        }
    }
}