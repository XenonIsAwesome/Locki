module.exports = {
    name: 'guildDelete',
    once: false,
    async execute(client, guild) {
        client.db.delete(guild.id);
    }
}