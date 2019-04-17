const Discord = require('discord.js');
const moment = require('moment');
const SimpleNodeLogger = require('simple-node-logger');

const config = require('../config.json');

const logOpts = {
    logFilePath: './log.txt',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS'
};
const log = SimpleNodeLogger.createSimpleLogger(logOpts);

const userIsAdmin = (message) => {
    const user = message.member;
    let allowed = false;

    for (let role in config.roles) {
        if (user.roles.find('name', config.roles[role])) {
            allowed = true;
        }
    }
    return allowed;
}

module.exports.userIsAdmin = userIsAdmin;