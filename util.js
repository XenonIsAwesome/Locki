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

    if (guildId) {
        app.guilds(guildId);
    }

    return app;
}

async function promote(client, interaction, newMemberId, c_id) {
    const g = await client.guilds.fetch(interaction.guild_id);
    const newOwner = await g.members.fetch(newMemberId);
    const oldOwner = await g.members.fetch(interaction.member.user.id);
    
    const normalRoleId = client.lockiRooms[c_id].normalRole;
    const ownerRoleId = client.lockiRooms[c_id].ownerRole;

    newOwner.roles.remove(normalRoleId);
    newOwner.roles.add(ownerRoleId);

    oldOwner.roles.remove(ownerRoleId);
    oldOwner.roles.add(normalRoleId);

    client.lockiRooms[c_id].owner = newOwner.id;
}

module.exports = {
    validateChat,
    validateRole,
    genRandCode,
    parseArgs,
    interactionReply,
    getApp,
    promote
}