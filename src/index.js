require("dotenv").config();
const { searchForListings } = require("./akelius");
const cron = require("node-cron");

cron.schedule("* */1 * * *", () => {
  console.log(`${new Date().toISOString()} - searching for listings`);
  searchForListings();
});
