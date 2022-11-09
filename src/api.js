const crypto = require("crypto");
const debug = require("debug")("xtie:api");
const db = require("./db");
const { cache } = require("./cache");
const router = require("express").Router();

/**
 * Hash string with SHA256
 * @param {string} subdomain - sting a
 * @param {string} key -
 * @returns {string} - hash
 */
function sha256(...strings) {
    const { SALT } = process.env.SALT;
    return crypto
        .createHash('sha256')
        .update(`${SALT}${strings.join('')}`)
        .digest('hex');
}

/**
 * POST /api/update
 * @body {
 *  subdomain: origin subdomain
 *  destination: where to redirect user to (or empty string to delete)
 *  protection: optional password to prevent changes
 * }
 * @returns 400, 401,
 */
router.post("/update", async (req, res) => {
    // Validate body
    const { subdomain, destination, protection } = req.body;
    if (!subdomain)
        return res.status(400).send("body missing subdomain field");
    if (!destination)
        return res.status(400).send("body missing destination field");
    if (protection === undefined)
        return res.status(400).send("body missing protection field");

    // Process body
    const prot = sha256(subdomain, protection);
    let dest = destination.startsWith('http') && destination.includes('://')
        ? destination : 'https://' + destination;
    if (dest.endsWith('/'))
	dest = dest.slice(0, -1);

    // Check for pre-existing rule
    const rule = cache[subdomain];

    // Rule already exists
    if (rule) {
        // Invalid credentials
        if (prot !== rule.protection) {
            const hostname = process.env.HOSTNAME || 'xtie.net' || req.headers.host;
            res.status(401).send(`Incorrect protection key. Unauthorized to change ${subdomain}.${hostname}.`);
            debug('Wrong protection key (length: %d)', protection.length);
            return;
        }

        if (destination === '') {
            await db.queryProm("DELETE FROM Rules WHERE subdomain=?", [subdomain], false);
            const { destination } = cache[subdomain];
            delete cache[subdomain];
            debug(`Remove rule ${subdomain}: was ${destination}`);
            return;
        }

        // Update rule
        await db.queryProm("UPDATE Rules SET destination=? WHERE subdomain=?", [dest, subdomain], false);
        // res.status(200).send("success");
        res.redirect('/');

        // Update cache
        const old = cache[subdomain].destination
        cache[subdomain].destination = dest;
        debug(`Updated rule ${subdomain}: ${old} => ${dest}`);
        return;
    }

    // Create new rule
    const ts = Date.now();
    await db.queryProm(
        "INSERT INTO Rules (subdomain, destination, protection, ts) VALUES (?, ?, ?, ?);",
        [ subdomain, dest, prot, ts ],
        false,
    );
    cache[subdomain] = { destination: dest, protection: prot, ts, hits: 0 };
    debug(`Add rule ${subdomain}: ${dest}`);
    // res.status(200).send("success");
    res.redirect('/');
});

/**
 * GET /api/rules
 * Gives a list of user-submitted redirect rules
 */
router.get('/rules', async (req, res) => {
    // Don't send protection
    const ret = Object.entries(cache)
        .map(([subdomain, r]) => ({ subdomain, destination: r.destination, ts: r.ts, hits: r.hits }))
    res.json(ret);
});

module.exports = router;
