// https://discord.com/oauth2/authorize?client_id=875477594634592317&permissions=8&scope=bot%20applications.commands

require('dotenv').config()
const { initEvents } = require('./init.js')

const { Client } = require('discord.js');
const client = new Client();

initEvents(client);

client.login(process.env.TOKEN);