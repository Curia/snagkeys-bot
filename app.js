const Discord = require("discord.js");
const moment = require("moment");

const client = new Discord.Client();
const config = require("./config.json");

client.on('ready', () => {
    console.log(`${moment()} : Snagbot started\n`);
});

client.on('message', message => {

    // Dirty way to only allow users in config.roles list to execute commands.
    if (!authUser(message)) return false;
    logInput(message);

    switch (message.content) {
        // Force shutdown bot
        case `${config.prefix}shutdown`:
            shutdown(message);
            break;
            // Cleanup the ad channel
        case `${config.prefix}prune`:
            pruneMarket(message);
            checkListings(message);
            break;
    }
});

const listChannels = () => {
    const chanList = client.channels;

    console.log(`Channels avaliable: \n`);
    chanList.map(c => {
        console.log(`${c.id}\n  Name: ${c.name} \n`)
    });
}

const updateMarketRules = (channel) => {
    channel.fetchMessages({
        limit: 100
    })
    .then(messages => {
        const filtered = messages.filter(msg => msg.author.id === config.botId);
        channel.bulkDelete(filtered, false)
    })
    .catch(console.error);
    channel.send(`**Market Rules**\n    - One ad per user\n    - Posting new ads will remove your previous ads\n    - Provide photo of item\n    - Please remove your post once sale is made\n\n Any bugs with the bot, PM <@${config.authorId}>`)
};

const checkListings = (message) => {
    const user = message.author;
    const channel = message.channel;

    if (config.channels.find(c => {
            return c == channel.id
        })) {
        channel.fetchMessages({
                limit: 100
            })
            // Get the messages
            .then(messages => {
                // Filter to only get the commenting users messages
                const filtered = messages.filter(msg => msg.author.id === user.id && msg.id !== message.id);
                console.log(`${moment()} : User ${user.username}:${user.id} already has ${filtered.size} posts`)
                console.log(`${moment()} : Deleting ${filtered.size} old posts`)
                message.channel.bulkDelete(filtered, false)
            })
            .catch(console.error);
            updateMarketRules(channel)
    }
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
        .then(() => {
            console.log(`${moment()} : Deleting ${msgCollection.length} messages`)
            message.channel.bulkDelete(msgCollection, false)
        })
        .catch(console.error);
    message.delete();
}

const shutdown = (message) => {

    message.channel.send('Beep boop, shutting down....')
        .then(msg => client.destroy())
}

const logInput = (message) => {
    console.log(`${moment()} : "${message.content}" sent by ${message.author.username}:#${message.author.id} in channel ${message.channel}`);
}

const authUser = (message) => {
    const user = message.member;
    let allowed = false;

    for (let role in config.roles) {
        user.roles.find('name', config.roles[role])
        allowed = true;
    }
    return allowed;
}

// Log our bot in
client.login(config.token);