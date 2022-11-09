const debug = require("debug")("xtie:cache");
const db = require("./db");
db.begin();

/**
 * Note that we only using the database for persistence
 *
 * Most of the time we'll use the cache as it's faster
 */

// Cache so that we can avoid database
const cache = {
    // Example rule (note user can't change it here)
    www: {
        destination: `http://${process.env.HOSTNAME}`,
        protection: "lol what",
	hits: 0,
    },
};

// Populate cache on server start
setTimeout(async () => {
    const rules = await db.queryProm("SELECT * FROM Rules", [], true);
    rules.forEach(({subdomain, destination, protection, ts, hits }) => {
        cache[subdomain] = { destination, protection, ts, hits };
    });
    debug("populated cache with %d entries", rules.length);
}, 100);

// Export cache
module.exports.cache = cache;
