
const debug = require("debug")
const { cache } = require('./cache');

const pivot = '.' + process.env.HOSTNAME;

//
module.exports = async (req, res, next) => {
    // Get url
    const [subdomain, found] = req.hostname.split(pivot);
    if (found === undefined)
        return next();

    console.log(req.path);

    // Check redirects
    const r = cache[subdomain];
    if (!r)
        return res.redirect(404, process.env.HOSTNAME);


    // Redirect them
    res.redirect(r.destination + req.path);

};