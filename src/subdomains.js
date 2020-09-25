const debug = require("debug")('xtie:subdomain');
const { cache } = require('./cache');

// Middleware to handle subdomain redirects
const pivot = '.' + process.env.HOSTNAME;
module.exports = async (req, res, next) => {
    // Verify it's actually a subdomain
    const [subdomain, found] = req.hostname.split(pivot);
    if (found === undefined)
        return next();

    // Check redirects
    const r = cache[subdomain];
    if (!r) {
        res.redirect(404, process.env.HOSTNAME);
        debug(`No rule for ${subdomain}`);
        return;
    }

    // Redirect them
    const dest = r.destination + req.path;
    res.redirect(dest);
    debug(`Redirect ${subdomain}: ${dest}`);
};