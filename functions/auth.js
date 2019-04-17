const Discord = require("discord.js");
const moment = require("moment");

const config = require("../config.json");

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