const Discord = require("discord.js");
const moment = require("moment");

const client = new Discord.Client();
const config = require("./config.json");

// Functions
const market = require('./functions/market');

client.on('ready', () => {
    console.log(`${moment()} : Snagbot started\n`);
    listChannels();
});

client.on('message', message => {
    // Ignore if bot 
    if (message.author.bot) return;

    // Ensure bot only reacts in a valid channel
    if (config.channels.find(c => c == message.channel.id)) {

        // Respond to allowed roles only
        if (authUser(message)) {
            logInput(message);

            switch (message.content) {
                // Force shutdown bot
                case `${config.prefix}shutdown`:
                    shutdown(message);
                    break;
                    // Cleanup the ad channel
                case `${config.prefix}prune`:
                    market.pruneMarket(message);
                    break;
                default:
                    //checkListings(message);
            }
        } else {
            //checkListings(message);
        };
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
    const embed = new Discord.RichEmbed()
        .setTitle("***Market rules***")
        .setColor(0x00AE86)
        .setDescription(`- One ad per user\n   - Prices are in AUD unless specified otherwise\n - Posting new ads will remove your previous ads\n    - Provide photo of item if possible\n    - Please remove your post once sale is made\n - Ads older than two weeks will be removed automatically\n\n Any bugs with the bot, PM <@${config.authorId}>`);

    channel.fetchMessages({
            limit: 100
        })
        .then(messages => {
            const filtered = messages.filter(msg => msg.author.id === config.botId);
            channel.bulkDelete(filtered, true)
        })
        .catch(console.error);

    channel.send({
        embed
    });
};

const notifyUser = (user, channel, message) => {
    user.send(`An old ad from ${channel} was removed since you posted a new one. \nContents of the old ad are below \`\`\` ${message} \`\`\`If you think this is a mistake, PM the bot author: <@${config.authorId}>`)
        .then(message => console.log(`Sent message: ${message.content}`))
        .catch(console.error);
}

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
                const lastAd = filtered.last()
                console.log(`${moment()} : User ${user.username}:${user.id} already has ${filtered.size} posts`)

                if (filtered.size > 0) {
                    console.log(`${moment()} : Deleting ${filtered.size} old posts`)
                    message.channel.bulkDelete(filtered, false)
                    notifyUser(user, channel, lastAd.content)
                }

            })
            .catch(console.error);

        updateMarketRules(channel)
    }
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
        if (user.roles.find('name', config.roles[role])) {
            allowed = true;
        }
    }
    return allowed;
}

// Log our bot in
client.login(config.token);