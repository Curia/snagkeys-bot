const Discord = require('discord.js');
const moment = require('moment');
const SimpleNodeLogger = require('simple-node-logger');

const client = new Discord.Client();
const config = require('./config.json');

// Functions
const market = require('./functions/market');
const auth = require('./functions/auth');

const logOpts = {
    logFilePath: './log.txt',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};
const log = SimpleNodeLogger.createSimpleLogger(logOpts);

client.on('ready', () => {
    log.info(`Bot logged in`);
    console.log(`Channels avaliable:`);
    client.channels.map(c => {
        console.log(` - ${c.name}:${c.id}`);
    });
});

client.on('message', message => {
    // Ignore if bot 
    if (message.author.bot) return;

    // Ensure bot only reacts in a valid channel
    if (config.channels.find(c => c == message.channel.id)) {

        // Respond to allowed roles only
        if (auth.userIsAdmin(message)) {
            log.info(`${message.author.username}:${message.author.id}, "${message.content}", ${message.channel}`);

            switch (message.content) {
                // Force shutdown bot
                case `${config.prefix}shutdown`:
                    log.warn(`shutdown by ${message.author.username}:${message.author.id}`)
                    message.delete();
                    client.destroy()
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

// Log our bot in
client.login(config.token);