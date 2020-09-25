const debug = require("debug")('xtie:subdomain');
const { cache } = require('./cache');

// Middleware to handle subdomain redirects
const pivot = '.' + process.env.HOSTNAME;
module.exports = async (req, res, next) => {
    // Get url
    const [subdomain, found] = req.hostname.split(pivot);
    if (found === undefined)
        return next();

    // Check redirects
    const r = cache[subdomain];
    if (!r)
        return res.redirect(404, process.env.HOSTNAME);

    // Redirect them
    const dest = r.destination + req.path;
    res.redirect(dest);
    debug(`Redirect ${subdomain}: ${dest}`);
};