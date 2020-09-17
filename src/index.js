require("dotenv").config();
const debug = require("debug")("xtie:server");


// Express server
const express = require("express");
const app = express();

// Parse body for POST requests
const bodyParser = require("body-parser");
app.use(bodyParser.json());



app.use("/", express.static("./static", { fallthrough: true }));

// Start server
if (require.main == module) 
    app.listen(process.env.PORT, () => 
        debug("Server listening on port %d", globals.port));