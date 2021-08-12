function parseArgs(args) {
    if (!args) { return { no: "args" }; }

    newArgs = {};
    args.forEach(a => {
        newArgs[a.name] = { value: a.value, type: a.type };
    });

    return newArgs;
}

function interactionReply(client, interaction, replyData) {
    return client.api.interactions(interaction.id, interaction.token)
        .callback.post({
            data: {
                type: 4,
                data: replyData
            }
        });
}

function getApp(client, guildId) {
    const app = client.api.applications(client.user.id);

    if (guildId != '') {
        app.guilds(guildId);
    }

    return app;
}

module.exports = {
    parseArgs,
    interactionReply,
    getApp
}