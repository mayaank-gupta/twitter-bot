let Twit = require("twit");
let sendNotification = require("./helpers").sendNotification;

let T = new Twit(require("./config"));
const safePromise = require("./safe-promise");

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

function getTweets() {
  return new Promise((resolve, reject) => {
    const hashTags = ["#datascience", "#javascript", "#chatgpt", "#ml"];

    const random = Math.floor(Math.random() * hashTags.length);

    let searchHashtag = {
      q: hashTags[random],
      count: 12,
      result_type: "recent",
    };

    T.get("search/tweets", searchHashtag, (err, data) => {
      if (err) {
        console.log("Cannot Grab Latest Tweet On Hashtag: ", searchHashtag.q);
        return reject(err);
      }
      if (data && data.statuses.length) {
        return resolve(data);
      } else {
        console.log("No Tweets on the Hashtag: ", searchHashtag.q);
        return resolve(null);
      }
    });
  });
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
  });
}

async function retweet() {
  let [error, data] = await safePromise(getTweets());

  if (error) {
    retweet();
  }

  if (data && data.statuses.length) {
    for (let i = 0; i < data.statuses.length; i++) {
      let tweet = data.statuses[i];
      let [err, successTweet] = await safePromise(postTweet(tweet));

      if (err) {
        await sendNotification("Error");
      }
      await sendNotification(i);
      await timer(1000 * 150);
    }
  } else {
    retweet();
  }
}

retweet();
