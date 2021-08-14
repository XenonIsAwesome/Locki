module.exports = {
    name: 'message',
    once: false,
    async execute(client, msg) {
        if (!msg.content.startsWith(process.env.PREFIX) || msg.author.bot) return;

        const cArgs = msg.content.slice(process.env.PREFIX.length).trim().split(/ +/);
        const cName = cArgs.shift().toLowerCase();
    
        if (!client.commands.has(cName)) return;
    
        try {
            client.commands.get(cName).execute(client, msg, cArgs);
        } catch (error) {
            console.error(error);
            msg.reply(`There was an error trying to execute that command!\n**${error}**`);
        }
    }
}