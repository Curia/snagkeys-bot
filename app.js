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
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
});

// Create an event listener for messages
client.on('message', message => {
    // If the message is "ping"
    if (message.content === 'ping') {
        // Send "pong" to the same channel
        message.channel.send('pong');
    }
});

// Log our bot in
client.login(config.token);