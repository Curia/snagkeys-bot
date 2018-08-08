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
    const guildList = client.guilds;

    console.log(`Bot initiated! \n`);
    listChannels();
});

// Create an event listener for messages
client.on('message', message => {
    console.log(`message sent in ${message.channel}`)

    switch(message.content.toLowerCase()) {
        case `${config.prefix}destroy`:
            closeBot(message.channel, message.author);
            break;
    }
});

const listChannels = () => {
    const chanList = client.channels;

    console.log(`Channels avaliable: \n`);
    chanList.map(c => {
        console.log(`Id: ${c.id}`)
        console.log(`Name: ${c.name} \n`)
    });
}


const closeBot = (channel, author) => {
    channel.send('Beep boop, shutting down....')
    .then(msg => client.destroy())
    .then(console.log(`Bot shutdown @ ${new Date()} by ${author.username} : #${author.id}`))
}

// Log our bot in
client.login(config.token);