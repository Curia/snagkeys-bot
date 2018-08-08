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
    switch(message.content.toLowerCase()) {
        case `${config.prefix}destroy`:
            closeBot(message);
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


const closeBot = (message) => {
    logCommand(message)
    message.channel.send('Beep boop, shutting down....')
    .then(msg => client.destroy())
}

const logCommand = (message) => {
    console.log(`Command "${message.content}" sent by ${message.author.username}:#${message.author.id} @ ${new Date()} in channel ${message.channel}`);
}

const getUserRole = (message) => {
    let allowed = false;

    logCommand(message)
    for (let role in config.roles) {
        message.member.roles.find('name', config.roles[role])
            allowed = true;
    }
    return allowed
}

// Log our bot in
client.login(config.token);