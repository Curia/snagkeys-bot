const Discord = require('discord.js');
const moment = require('moment');
const SimpleNodeLogger = require('simple-node-logger');

const config = require('../config.json');

const logOpts = {
    logFilePath: './log.txt',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};
const log = SimpleNodeLogger.createSimpleLogger(logOpts);


const deleteMessages = (collection) => {
    const arr = collection.array();
    for (let i = 0; i < arr.length; i++) {
        const message = arr[i];
        message.delete()
            .then(message => log.info(`Deleted message ${message.id} from ${message.author.username}`))
            .catch(error => log.error(error));
    }
}

module.exports = {
    deleteMessages: deleteMessages,
}