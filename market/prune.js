const Discord = require("discord.js");
const moment = require("moment");

const config = require("../config.json");

const pruneMarket = (msg) => {
    console.log(`Running prune of ${msg.channel}`);

    async function clear() {
        const fetched = await msg.channel.fetchMessages({limit: 99});
        const pruneDate = moment().clone().subtract(config.pruneDays, 'days').startOf('day');
        // Short timer for testing purposes
        //const pruneDate = moment().clone().subtract('30', 'seconds');
        const filtered = fetched.filter(message => moment(message.createdTimestamp).isBefore(pruneDate));

        console.log(`${filtered.size} messages to remove`)
        msg.delete();
        msg.channel.bulkDelete(filtered, true);
    }
    clear();
}

module.exports.pruneMarket = pruneMarket;