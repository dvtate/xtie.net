const debug = require("debug")('xtie:subdomain');
const { cache, setRules } = require('./cache');
const dns = require("dns");

// Look up cname dns record
async function getCname(hostname) {
    return new Promise((resolve, reject) => {
        dns.resolveCname(hostname, (err, records) => {
            if (err) reject(err);
            else resolve(records[0]);
        });
    });
}

// Middleware to handle subdomain redirects
const pivot = '.' + process.env.HOSTNAME;
module.exports = async (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    
    // Handle CNAME
    let { hostname } = req;
    if (!hostname)
	return next();
    if (!hostname.includes(process.env.HOSTNAME)) {
        try {
            hostname = await getCname(hostname);
        } catch (e) {
            return next();
        }
    }

    // Verify it's actually a subdomain
    const [subdomain, found] = hostname.split(pivot);
    const sub = subdomain.toLowerCase();
    if (found === undefined)
        return next();

    // Check redirects
    const r = cache[sub];
    if (!r) {
        res.redirect(404, `http://${process.env.HOSTNAME}`);
        debug(`No rule for ${sub}`);
        return;
    }

    // Redirect them
    const dest = r.destination + req.path;
    res.redirect(dest);
    debug(`Redirect ${sub}: ${dest} for ${ip}`);

    cache[sub].hits++;
    setRules();
};

