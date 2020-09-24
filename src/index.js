// Load config
require("dotenv").config();
require("./db").begin();

// Express server
const express = require("express");
const app = express();

// Parse body for POST requests
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Subdomain routing
app.use(require('./subdomains'));
// app.use("/api", require('./api'));
app.use("/", express.static("./static", { fallthrough: true }));

// Start server
const debug = require("debug")("xtie:server");
if (require.main == module)
    app.listen(process.env.PORT, () =>
        debug("Server listening on port %d", globals.port));