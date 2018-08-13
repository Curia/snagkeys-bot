const Discord = require("discord.js");
const moment = require("moment");

const client = new Discord.Client();
const config = require("./config.json");

client.on('ready', () => {
    console.log(`Bot initiated! \n`);
});

client.on('message', message => {
    
    // Dirty way to only allow users in config.roles list to execute commands.
    if (authUser()) return false;
    logInput(message);

    switch (message.content) {
        // Force shutdown bot
        case `${config.prefix}shutdown`:
            shutdown(message);
            break;
        // Removes old listings from market channels
        case `${config.prefix}prune`:
            pruneMarket(message);
            break;
    }
});

const listChannels = () => {
    const chanList = client.channels;

    console.log(`Channels avaliable: \n`);
    chanList.map(c => {
        console.log(`${c.id}`)
        console.log(`  Name: ${c.name} \n`)
    });
}

const checkListings = (message) => {
    const user = message.author;
    const channel = message.channel;
}

const pruneMarket = (message) => {
    const pruneDate = moment().subtract(config.pruneAmount, 'days');
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

const shutdown = (message) => {
    
    message.channel.send('Beep boop, shutting down....')
        .then(msg => client.destroy())
}

const logInput = (message) => {
    console.log(`Command "${message.content}" sent by ${message.author.username}:#${message.author.id} @ ${new Date()} in channel ${message.channel}`);
}

const authUser = (message) => {
    let allowed = false;

    for (let role in config.roles) {
        message.member.roles.find('name', config.roles[role])
        allowed = true;
    }
    return allowed;
}

// Log our bot in
client.login(config.token);