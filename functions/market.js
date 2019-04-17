const Discord = require('discord.js');
const moment = require('moment');
const SimpleNodeLogger = require('simple-node-logger');

const config = require('../config.json');

const logOpts = {
    logFilePath: './log.txt',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};
const log = SimpleNodeLogger.createSimpleLogger(logOpts);


// Removes messages over two weeks old
const pruneMarket = (msg) => {

    async function clear() {
        const fetched = await msg.channel.fetchMessages({
            limit: 99
        });
        // Short timer for testing purposes
        //const pruneDate = moment().clone().subtract('30', 'seconds');
        const pruneDate = moment().clone().subtract(config.pruneDays, 'days').startOf('day');
        const filtered = fetched.filter(message => moment(message.createdTimestamp).isBefore(pruneDate));
        log.info(`Pruning ${filtered.size} messages`);
        msg.delete();
        msg.channel.bulkDelete(filtered, true);
    }
    clear();
}

// Checks if current user posting already has ads and removes them.
const checkListings = (post) => {
    const user = post.author;
    const channel = post.channel;

    channel.fetchMessages({ limit: 100 })
        .then(ads => {
            log.info(`${user.username}:${user.id} has ${ads.size} ads`)
            const filtered = ads.filter(ad => ad.author.id === user.id && ad.id != post.id);

            if (filtered.size) {
                log.info(`Removing additional ads from ${user.username}:${user.id}`);
                post.channel.bulkDelete(filtered, false);
            }

            // Send a copy of old ad to user
            notifyUser(user, channel, filtered.last())
        })
        .catch(error => { log.error(error) });
    updateRules(channel);
}

const updateRules = (channel) => {
    const embed = new Discord.RichEmbed()
        .setTitle("***Market rules***")
        .setColor(0x00AE86)
        .setDescription(`- One ad per user\n   - All prices in AUD unless specified otherwise\n    - Provide photo of item if possible\n - Ads older than two weeks will be removed automatically\n Bugs or comments, PM <@${config.authorId}>`);

    channel.fetchMessages({ limit: 100 })
        .then(messages => {
            const filtered = messages.filter(msg => msg.author.id === config.botId);
            channel.bulkDelete(filtered, true)
        })
        .catch(error => { log.error(error) });

    channel.send({ embed });
};

const notifyUser = (user, channel, message) => {
    const messageStr = message.content.replace(/`/g, '');

    user.send(`An old ad from ${channel} was removed since you posted a new one. \nContents of the old ad are below \`\`\` ${messageStr} \`\`\`If you think this is a mistake, PM the bot author: <@${config.authorId}>`)
        .catch(error => { log.error(error) });
}

module.exports = {
    pruneMarket: pruneMarket,
    checkListings: checkListings,
    updateRules: updateRules,
    notifyUser: notifyUser
}