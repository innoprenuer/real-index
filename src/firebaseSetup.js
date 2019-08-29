let firebaseInstance = require("firebase");

let config = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DB_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: "",
  messagingSenderId: process.env.MSG_SENDER_ID,
  appId: process.env.APP_ID
};

function initializeFirebase() {
  // Initialize Firebase
  firebaseInstance.initializeApp(config);
  console.log("Firebase Initialized");
}

async function saveListing(listingId) {
  console.log(`ListingId to be saved - ${listingId}`);
  await firebaseInstance
    .database()
    .ref("listings/1234")
    .set({ listingId: listingId });
}

async function doesListingExists(listingId) {
  let snapshot = await firebaseInstance
    .database()
    .ref("/listings")
    .once("value");

  let savedListings = snapshot.val();
  console.log(JSON.stringify(savedListings));
  for (let key in savedListings) {
    if (key == listingId) {
      console.log(`Listing ${listingId} exists in db`);
      return true;
    }
  }

  console.log(`Listing ${listingId} doesn't exist in db`);
  return false;
}

//initialise firebase
initializeFirebase();

module.exports = { saveListing, doesListingExists };
