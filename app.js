const Discord = require("discord.js");
const moment = require("moment");

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
    switch(message.content) {
        case `${config.prefix}destroy`:
            closeBot(message);
            break;
        case `${config.prefix}prune`:
            pruneMarket(message);
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

const pruneMarket = (message) => {
    const pruneDate = moment().subtract(config.pruneDays, 'days');
    let msgCollection = [];

    message.channel.fetchMessages()
        .then(messages => {
            let msgArr = messages.array();
            
            msgCollection = msgArr.filter(msg => {
                const timeStamp = msg.editedTimestamp === null ? moment(msg.createdAt) : moment(msg.editedTimestamp)
                if (pruneDate > timeStamp) {
                    return msg;
                }
            })
        })
        .then(e => message.channel.bulkDelete(msgCollection, true))
        .catch(console.error);
        message.delete();
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