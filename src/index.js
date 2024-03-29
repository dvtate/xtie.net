// Load configs
require("dotenv").config();

// Express server
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

const debug = require("debug")("xtie:server");
const querystring = require('querystring');
app.use((req, res, next) => {
    //if (req.path === "/") return next();
    const bodyString = JSON.stringify(req.body);
    const qs = querystring.stringify(req.query);
    debug(`${req.method} ${req.path}${qs ? '?' + qs : ''} body=${bodyString.length > 2 ? bodyString.length.toString() + " bytes" : "∅"} (${req.ip})`);
    next();
});

// Subdomain routing middleware
app.use(require('./subdomains'));

// API routes
app.use("/api", require('./api'));

// Static pages
app.use("/", express.static("./static", { fallthrough: true }));

// Import http server stuff
//const https = require('https');
const http = require('http');
const fs = require('fs');

// Start http server
const httpPort = Number(process.env.PORT) || 8080;
const httpServer = http.createServer(app);
httpServer.listen(httpPort, () => debug(`http listening on port ${httpPort}.`));

// Start https server
// if (process.env.SSL_KEY && process.env.SSL_CERT) {
//     const httpsServer = https.createServer({
//         key: fs.readFileSync(process.env.SSL_KEY),
//         cert: fs.readFileSync(process.env.SSL_CERT),
//     }, app);
//     httpsServer.listen(443, () => debug('https listening on 443'));
// }
