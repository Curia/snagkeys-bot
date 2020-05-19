const Discord = require('discord.js');
const moment = require('moment');
const SimpleNodeLogger = require('simple-node-logger');

const config = require('../config.json');
const utils = require('./utils');

const logOpts = {
  logFilePath: './log.txt',
  timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};
const log = SimpleNodeLogger.createSimpleLogger(logOpts);

const pruneChannel = (channel) => {
  const expireDate = moment().subtract(13, 'days');

  // .bulkDelete is unable to remove messages over 2 weeks old
  // so have to manually loop and remove each one
  channel.fetchMessages().then(messages => {
    const pruneMsg = messages.filter(message => moment(message.createdTimestamp).isBefore(expireDate));
    utils.deleteMessages(pruneMsg);
  })
}

// Checks if current user posting already has ads and removes them.
const checkListings = (post) => {
  const user = post.author;
  const channel = post.channel;

  channel.fetchMessages()
    .then(ads => {
      const filtered = ads.filter(ad => ad.author.id === user.id && ad.id != post.id);

      if (filtered.size) {
        log.info(`User ${user.username}:${user.id} has ${filtered.size} messages, removing`);
        utils.deleteMessages(filtered);
        // Send a copy of old ad to user
        notifyUser(user, channel, filtered.last())
      }
    })
    .catch(error => { log.error(error) });
  pruneChannel(channel)
  updateRules(channel);
}

const updateRules = (channel) => {
  const embed = new Discord.RichEmbed()
    .setTitle("***Market rules***")
    .setColor(0x00AE86)
    .setDescription(`- One ad per user\n   - All prices in ${config.currency} unless specified otherwise\n    - Provide photo of item if possible\n Bugs or comments, PM <@${config.authorId}>`);

  // Remove old rule posting and resend it
  channel.fetchMessages().then(msg => {
    const oldRule = msg.filter(msg => msg.author.id === config.botId);
    utils.deleteMessages(oldRule);
  })
  channel.send({ embed });
};

const notifyUser = (user, channel, message) => {
  const messageStr = message.content.replace(/`/g, '');
  if (message.attachments.size) {
    const attachments = message.attachments.array()[0];
    user.send(`An old ad from ${channel} was removed since you posted a new one. \nContents of the old ad are below \`\`\` ${messageStr} \`\`\`If you think this is a mistake, PM the bot author: <@${config.authorId}>`, {
      files: [{
        attachment: attachments.proxyURL,
      }]
    })
      .catch(error => { log.error(error) });
  } else {
    user.send(`An old ad from ${channel} was removed since you posted a new one. \nContents of the old ad are below \`\`\` ${messageStr} \`\`\`If you think this is a mistake, PM the bot author: <@${config.authorId}>`)
      .catch(error => { log.error(error) });
  }

}

module.exports = {
  checkListings: checkListings,
  updateRules: updateRules,
  pruneChannel: pruneChannel
}