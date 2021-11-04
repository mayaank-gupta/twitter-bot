
let Twit = require("twit");
let sendNotification = require('./helpers').sendNotification;

let T = new Twit(require("./config"));
const safePromise = require('./safe-promise');

const timer = ms => new Promise(res => setTimeout(res, ms));

function getTweets() {
  return new Promise((resolve, reject) => {

    const hashTags = ["#datascience", "#nodejs", "#ai"];

    const random = Math.floor(Math.random() * hashTags.length);

    let searchHashtag = {
      q: hashTags[random],
      count: 12,
      result_type: "recent"
    };

    T.get("search/tweets", searchHashtag, (err, data) => {
      if (err) {
        console.log("Cannot Grab Latest Tweet On Hashtag: ", searchHashtag.q);
        return reject(err);
      }
      if (data && data.statuses.length > 0) {
        return resolve(data)
      } else {
        console.log("No Tweets on the Hashtag: ", searchHashtag.q);
        return resolve(null);
      }
    })
  })
}

function postTweet(tweet) {
  return new Promise((resolve, reject) => {

    T.post("statuses/retweet/" + tweet.id_str, async (e, res) => {
      if (e) {
        console.log("Cannot Retweet your Tweet!");
        return reject(e);
      }
      return resolve(true);
    });

  })
}

async function retweet() {
  let [error, data] = await safePromise(getTweets());

  if (data && data.statuses.length > 0) {
    for (let i = 0; i < data.statuses.length; i++) {
      let tweet = data.statuses[i];
      let [error, successTweet] = await safePromise(postTweet(tweet));
      if (successTweet) {
        console.log('Tweet Done!');
      }

      await sendNotification(i);
      await timer(1000 * 200);
    }
  } else {
    console.log("No Tweets on the Hashtag:");
  }
  retweet();
}

retweet();