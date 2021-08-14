const { parseArgs, interactionReply } = require('../../util.js')

module.exports = {
    name: 'INTERACTION_CREATE',
    once: false,
    async execute(client, interaction) {
        if (interaction.data.name) {
            try {
                await client.slashCommands.get(interaction.data.name).execute(client, interaction, parseArgs(interaction.data.options));
            } catch (error) {
                console.error(error);
                interactionReply(client, interaction, {
                    content: error,
                    flags: 1 << 6
                });
            }
        } else if (interaction.data.custom_id) {
            const name = interaction.data.custom_id.split('.')[0];
            const args = JSON.parse(interaction.data.custom_id.split('.')[1]);
    
            try {
                await client.componentCommands.get(name).execute(client, interaction, args, whitelist);
            } catch (error) {
                console.error(error);
                interactionReply(client, interaction, {
                    content: error,
                    flags: 1 << 6
                });
            }
        }    
    }
}