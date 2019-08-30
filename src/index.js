require("dotenv").config();
const { searchForListings } = require("./akelius");
const cron = require("node-cron");

cron.schedule("* */1 * * *", () => {
  console.log(`${new Date().toISOString()} - searching for listings`);
  searchForListings();
});

// JUST for heroku
var http = require("http");
http
  .createServer(async function(req, res) {
    await searchForListings();
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.send("it is running\n");
  })
  .listen(process.env.PORT || 5000);
