const axios = require('axios');
const safePromise = require('../safe-promise');

const sendNotification = function (counter) {
  return new Promise(async (resolve, reject) => {
    let messageBody = {
      text: `Retweet Counter: ${counter}`
    }

    const requestOptions = {
      method: 'POST',
      url: process.env.SLACK_HOOK,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      data: messageBody
    };


    let [error, data] = await safePromise(axios(requestOptions));

    return resolve('ok');
  })
}

module.exports = sendNotification;