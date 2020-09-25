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
 */
router.post("/update", async (req, res) => {

    console.log(req.body);

    // Validate body
    const { subdomain, destination, protection } = req.body;
    if (!subdomain)
        return res.status(400).send("body missing subdomain field");
    if (!destination)
        return res.status(400).send("body missing destination field");
    if (!protection)
        return res.status(400).send("body missing protection field");
    const prot = sha256(subdomain, protection);

    // Check for pre-existing rule
    const rule = cache[subdomain];

    // Rule already exists
    if (rule) {
        // Invalid credentials
        if (prot !== rule.protection) {
            const hostname = process.env.HOSTNAME || 'xtie.net' || req.headers.host;
            res.status(401).send(`Incorrect protection key. Unauthorized to change ${subdomain}.${hostname}.`);
            return;
        }

        if (destination === '') {
            await db.queryProm("DELETE FROM Rules WHERE subdomain=?", [subdomain], false);
            delete cache[subdomain];
            return;
        }

        // Update rule
        await db.queryProm("UPDATE Rules SET destination=? WHERE subdomain=?", [destination, subdomain], false);
        res.status(200).send("success");
        cache[subdomain].destination = destination;
        return;
    }

    // Create new rule
    await db.queryProm(
        "INSERT INTO Rules (subdomain, destination, protection) VALUES (?, ?, ?);",
        [ subdomain, destination, prot ],
        false,
    );
    cache[subdomain] = { destination, protection: prot };

    res.status(200).send("success");
});

module.exports = router;