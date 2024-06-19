const debug = require("debug")("xtie:cache");
const fs = require('fs');

// Cache so that we can avoid database
const cache = {
    // Example rule (note user can't change it here)
    www: {
        destination: `http://${process.env.HOSTNAME}`,
        protection: "lol what",
        hits: 0,
    },
};

// No mutex needed as these are sync operations
function getRules() {
    if (!fs.existsSync('./xtie_rules.json'))
	fs.writeFileSync('./xtie_rules.json', '{}');
    Object.assign(cache, JSON.parse(fs.readFileSync("./xtie_rules.json").toString()));
}
function setRules() {
    fs.writeFileSync("./xtie_rules.json", JSON.stringify(cache));
}

// Populate cache on server start
getRules();
debug("populated cache with %d entries", Object.keys(cache).length);

// Export
module.exports = {
    cache,
    getRules,
    setRules,
};
