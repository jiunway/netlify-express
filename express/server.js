'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');

const line = require('@line/bot-sdk');
const line_api = require('./line_api.js');

const config = {
  channelAccessToken: "PRt8Txg9wGTbGYc3CLCmOFVRfhFZje8XX3i54mcYkqkbdugc381oMpb5WoHpf3wkEBFSXthoSULCVAhdyR9vyyBKncVMQe62FNGEJhFy9IsfNz6p2M7Q+FUGrT2W2bBAo1+43HONg+i05bld93f72AdB04t89/1O/w1cDnyilFU=",
  channelSecret: "c9b4359a229ca375989d58690d490372",
};

const client = new line.Client(config);

const router = express.Router();
router.get('/', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.write('<h1>Hello from Express.js!</h1>');
  res.end();
});

router.get('/getip', (req, res) => {
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  return res.send("show_ip('" + ip + "');");
});

router.get('/push', (req, res) => {
  client.pushMessage("Uc1cf0b16a4cfa6d9b099cc918064536d", {
    type: 'text',
    text: "test"
  }).catch(function(error) {
    console.log(error);
  });
});

router.post('/callback', line.middleware(config), (req, res) => {
  console.log("callback");
  Promise.all(req.body.events.map(handleEvent))
    .then(() => {
      //
    })
    .catch((err) => {
      console.error(err);
    });
});

function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
      }

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken, source) {
  console.log("User id:" + source.userId)
  console.log("User replyToken:" + replyToken)
  console.log("message:" + message.text);

  message.text = message.text.trim();

  if (message.text.startsWith('雲')) {
    handleSatellite(client, replyToken);
  }
}

function handleSatellite = (client, replyToken) => {
  var options = {
    url: "https://www.cwb.gov.tw/Data/js/obs_img/Observe_sat.js",
    method: 'GET'
  };
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var first = body.indexOf("\'LCC_IR1_CR_2750");
      var next = body.indexOf('\'', first + 1);
      var satellite_url = "https://www.cwb.gov.tw/Data/satellite/" + body.substring(first + 1, next);

      var options = {
        url: "https://www.cwb.gov.tw/Data/js/obs_img/Observe_radar.js",
        method: 'GET'
      };
      request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var first = body.indexOf("\'CV1_TW_3600");
          var next = body.indexOf('\'', first + 1);
          var rader_url = "https://www.cwb.gov.tw/Data/radar/" + body.substring(first + 1, next);

          let sateImageMessage = line_api.getImageMessage(satellite_url);
          let raderImageMessage = line_api.getImageMessage(rader_url);

          let pushMsgArr = [];
          pushMsgArr.push(sateImageMessage);
          pushMsgArr.push(raderImageMessage);

          line_api.replyMessage(client, replyToken, pushMsgArr);
        }
      });
    }
  });
}

app.use('/.netlify/functions/server', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
