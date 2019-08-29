let cheerio = require("cheerio");
let rp = require("request-promise");
let { sendEmail } = require("./emailer");
let { doesListingExists, saveListing } = require("./firebaseSetup");

let baseUrl = "https://rent.akelius.com";

let searchCriteria = {};
searchCriteria.sizeFrom = process.env.SIZE_FROM;
searchCriteria.sizeTo = process.env.SIZE_TO;
searchCriteria.roomFrom = process.env.ROOMS_FROM;

/**
 * constructs new url based on criteria
 * @param {*} baseUrl
 * @param {*} criteria
 */
function getSearchUrl(baseUrl, criteria) {
  let url = baseUrl + "/en/search/germany/apartment/berlin";
  let params = "";

  for (var key in criteria) {
    params += `${key}=${criteria[key]}&`;
  }

  params = params.substr(0, params.length - 1);

  url += `?${params}`;
  return url;
}

/**
 * returns listings that matches criteria
 */
async function searchForListings() {
  try {
    let html = await rp({
      url: getSearchUrl(baseUrl, searchCriteria),
      method: "get",
      timeout: 600000
    });

    //load html contents in jquery selector via cheerio;
    var $ = cheerio.load(html);

    $("app-unit-item").each(async function(i, elem) {
      //get listing details
      let listingDetails = getListingDetails(elem);

      //check if criteria is satisfied
      if (isCriteriaSatisfied(listingDetails)) {
        let { email, listingId } = await getContactDetails(
          listingDetails.listingUrl
        );

        //check if listing exists
        if (!(await doesListingExists(listingId))) {
          //save this listing
          await saveListing(listingId);

          //if its new listing, send email
          await sendEmail(email, listingId, listingDetails.address);
        }
      }
    });
  } catch (err) {
    console.error(err);
    return;
  }
}

/**
 * returns details for each listing
 * @param {*} listing
 */
function getListingDetails(listing) {
  let baseSelector = "div > a > div:nth-child(2)";
  var $ = cheerio.load(listing);

  let listingUrl =
    baseUrl +
    $(listing)
      .first()
      .find("div > a")
      .attr("href");
  console.log(listingUrl);

  let street = $(listing)
    .first()
    .find(baseSelector + " > div:nth-child(1) > div:nth-child(1) > h3")
    .text()
    .trim();
  console.log(street);

  let _address = $(listing)
    .first()
    .find(baseSelector + " > div:nth-child(1) > div:nth-child(2)")
    .text()
    .trim();

  let address = `${street}, ${_address}`;
  console.log(address);

  let _rooms = $(listing)
    .first()
    .find(
      baseSelector + " > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)"
    )
    .text()
    .trim();
  let rooms = _rooms.split("rooms ")[1];
  console.log(rooms);

  let _area = $(listing)
    .first()
    .find(
      baseSelector + " > div:nth-child(2) > div:nth-child(1) > div:nth-child(2)"
    )
    .text()
    .trim();
  let area = _area.split(" m²")[0];
  console.log(area);

  let _t = $(listing)
    .first()
    .find(baseSelector + " > div:nth-child(2) > div")
    .text()
    .trim();
  let _temp = _t.split("EUR ");
  let _t1 = _temp[1].split(" ");
  let price = _t1[0].replace(".", "");
  console.log(price);

  console.log("========");

  return {
    listingUrl,
    price,
    area,
    address,
    rooms
  };
}

/**
 * validates if criteria is satisfied for a given listing
 * @param {} listing
 */
function isCriteriaSatisfied(listing) {
  let { price, rooms, area } = listing;
  if (Number(price) <= Number(process.env.PRICE_TO)) {
    if (Number(rooms) >= Number(process.env.ROOMS_FROM)) {
      if (Number(area) >= Number(process.env.SIZE_FROM)) {
        console.log("Criteria satisfied");
        return true;
      }
    }
  }
  return false;
}

/**
 * returns the email of contact person
 * @param {} listingUrl
 */
async function getContactDetails(listingUrl) {
  try {
    let html = await rp({
      url: listingUrl,
      method: "get",
      timeout: 600000
    });

    //load html contents in jquery selector via cheerio;
    var $ = cheerio.load(html);

    let email = $("app-unit-detail-actions")
      .first()
      .find("div > a")
      .attr("href");

    return decodeEmailDetails(email);
  } catch (err) {
    console.error(err.message);
  }
}

function decodeEmailDetails(encodedData) {
  let decodedEmailString = decodeURIComponent(encodedData);
  let temp = decodedEmailString.split("?");
  let _temp = temp[0].split(":");
  console.log(`Email = ${_temp[1]}`);
  console.log(temp[1]);
  let listingId = temp[1].match(/[0-9-]+/);
  console.log(`Listing Id - ${listingId}`);
  return { email: _temp[1], listingId };
}

module.exports = {
  searchForListings
};
