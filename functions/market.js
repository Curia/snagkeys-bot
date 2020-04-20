const Discord = require('discord.js');
const moment = require('moment');
const SimpleNodeLogger = require('simple-node-logger');

const config = require('../config.json');

const logOpts = {
  logFilePath: './log.txt',
  timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};
const log = SimpleNodeLogger.createSimpleLogger(logOpts);

const pruneChannel = (channel) => {
  const expireDate = moment().subtract(13, 'seconds');

  // .bulkDelete is unable to remove messages over 2 weeks old
  // so have to manually loop and remove each one
  channel.fetchMessages().then(messages => {

    const pruneMsg = messages.filter(message => moment(message.createdTimestamp).isBefore(expireDate)).array();

    for (let i = 0; i < pruneMsg.length; i++) {
      const message = pruneMsg[i];
      message.delete()
        .then(msg => log.info(`Deleted message ${msg.id} from ${msg.author.username}`))
        .catch(console.error);
    }

  })
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

        // Send a copy of old ad to user
        notifyUser(user, channel, filtered.last())
      }
    })
    .catch(error => { log.error(error) });
  updateRules(channel);
}

const updateRules = (channel) => {
  const embed = new Discord.RichEmbed()
    .setTitle("***Market rules***")
    .setColor(0x00AE86)
    .setDescription(`- One ad per user\n   - All prices in AUD unless specified otherwise\n    - Provide photo of item if possible\n Bugs or comments, PM <@${config.authorId}>`);

  pruneChannel(channel);
  channel.send({ embed });
};

module.exports = {
  checkListings: checkListings,
  updateRules: updateRules
}