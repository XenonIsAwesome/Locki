module.exports = {
    name: 'guildDelete',
    once: false,
    async execute(client, guild) {
        client.db.guilds.remove({ guildId: guild.id });
    }
}