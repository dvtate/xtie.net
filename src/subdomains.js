//
const debug = require("debug")
const db = require("./db");


//
const subdomains_cache = {
    dvtt: "dvtate.com",
};
db.begin().then(() => {

});
setTimeout(async () => {
    await db.begin();
}, 100);
setInterval()

//
module.exports = async (req, res, next) => {
    console.log(req, res);
    next();
};