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
    if (destination.length > 2000)
        return res.status(400).send("Destination too long (max 2000 characters)");
    if (subdomain.length > 50)
	return res.status(400).send("Subdomain too long (max 50 characters)");

    // Process body
    const sub = subdomain.toLowerCase();
    const prot = sha256(sub, protection);
    let dest = destination.startsWith('http') && destination.includes('://')
        ? destination : 'https://' + destination;
    if (dest.endsWith('/'))
	dest = dest.slice(0, -1);

    // Check for pre-existing rule
    const rule = cache[sub];

    // Rule already exists
    if (rule) {
        // Invalid credentials
        if (prot !== rule.protection) {
            const hostname = process.env.HOSTNAME || 'xtie.net' || req.headers.host;
            res.status(401).send(`Incorrect protection key. Unauthorized to change ${sub}.${hostname}.`);
            debug('Wrong protection key (length: %d)', protection.length);
            return;
        }

        if (destination === '') {
            await db.queryProm("DELETE FROM Rules WHERE subdomain=?", [sub], false);
            const { destination } = cache[sub];
            delete cache[sub];
            debug(`Remove rule ${sub}: was ${destination}`);
            return;
        }

        // Update rule
        await db.queryProm("UPDATE Rules SET destination=? WHERE subdomain=?", [dest, sub], false);
        // res.status(200).send("success");
        res.redirect('/');

        // Update cache
        const old = cache[sub].destination
        cache[sub].destination = dest;
        debug(`Updated rule ${sub}: ${old} => ${dest}`);
        return;
    }

    // Create new rule
    const ts = Date.now();
    await db.queryProm(
        "INSERT INTO Rules (subdomain, destination, protection, ts) VALUES (?, ?, ?, ?);",
        [ sub, dest, prot, ts ],
        false,
    );
    cache[sub] = { destination: dest, protection: prot, ts, hits: 0 };
    debug(`Add rule ${sub}: ${dest}`);
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
