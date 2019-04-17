const Discord = require("discord.js");
const moment = require("moment");

const config = require("../config.json");


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

        console.log(`${filtered.size} messages to remove`)
        msg.delete();
        msg.channel.bulkDelete(filtered, true);
    }
    clear();
}

// Checks if current user posting already has ads and removes them.
const checkListings = (post) => {
    const user = post.author;
    const channel = post.channel;
    console.log('checking listings')

    channel.fetchMessages({ limit: 100 })
        .then(ads => {
            console.log(`User ${user.username}:${user.id} has ${ads.size} ads`);
            const filtered = ads.filter(ad => ad.author.id === user.id && ad.id != post.id);

            if (filtered.size) {
                console.log(`Removing additional ads from ${user.username}:${user.id}`);
                post.channel.bulkDelete(filtered, false);
            }
        })
        .catch(console.error);
}

module.exports = {
    pruneMarket: pruneMarket,
    checkListings: checkListings
}