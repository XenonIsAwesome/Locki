function validateChat(chat) {
    chatRe = /⎯⎯ \[(🔓|🔒)\] [A-Z0-9]{6} ⎯⎯/;
    return chatRe.test(chat.name);
}

function validateRole(role) {
    roleRe = /\[(🔑|👑)\] [A-Z0-9]{6}/;
    return roleRe.test(role.name);
}

function genRandCode() {
    const alphabeth = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let st = '';
    for (let i = 0; i < 6; i++) {
        st += alphabeth[Math.floor(Math.random() * alphabeth.length)]
    }

    return st;
}

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
    validateChat,
    validateRole,
    genRandCode,
    parseArgs,
    interactionReply,
    getApp
}