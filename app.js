// Load up the discord.js library
const Discord = require("discord.js");

// This is your client.
const client = new Discord.Client();

// Load config
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

// On bot ready.
client.on('ready', () => {
    const chanList = client.channels;
    const guildList = client.guilds;

    console.log(`Bot initiated! \n`);
    console.log(`Channels avaliable: \n`);
    chanList.map(c => {
        console.log(`Id: ${c.id}`)
        console.log(`Name: ${c.name} \n`)
    });
});

// Create an event listener for messages
client.on('message', message => {
    console.log(`message sent in ${message.channel}`)
});

// Log our bot in
client.login(config.token);