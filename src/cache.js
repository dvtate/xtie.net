const debug = require("debug")("xtie:chache");
const db = require("./db");
db.begin();

//
const cache = {
};


// Populate cache on server start
setTimeout(async () => {
    const rules = await db.queryProm("SELECT * FROM Rules", [], true);
    rules.forEach(({subdomain, destination, protection}) => {
        cache[subdomain] = { destination, protection };
    });
    debug("populated cache with %d entries", rules.length);
}, 100);

// Export cache
module.exports.cache = cache;