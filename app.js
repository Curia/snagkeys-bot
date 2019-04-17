const Discord = require("discord.js");
const moment = require("moment");

const client = new Discord.Client();
const config = require("./config.json");

// Functions
const market = require('./functions/market');
const auth = require('./functions/auth');

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
        if (auth.userIsAdmin(message)) {
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
                    market.checkListings(message);
            }
        } else {
            market.checkListings(message);
        };
    }

});

const listChannels = () => {
    const chanList = client.channels;

    console.log(`Channels avaliable:`);
    chanList.map(c => {
        console.log(` - ${c.name}:${c.id}`);
    });
}

const shutdown = (message) => {
    message.channel.send('Beep boop, shutting down....')
        .then(msg => client.destroy())
}

const logInput = (message) => {
    console.log(`${moment()} : "${message.content}" sent by ${message.author.username}:#${message.author.id} in channel ${message.channel}`);
}

// Log our bot in
client.login(config.token);