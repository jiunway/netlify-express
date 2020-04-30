'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const line = require('@line/bot-sdk');

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

router.post('/push1', (req, res) => {
  console.log("push1");
});

router.get('/push2', (req, res) => {
  console.log("push2");
});

router.post('/callback', line.middleware(config), (req, res) => {
  console.log("callback");
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
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

  client.replyMessage(replyToken, {
    type: 'text',
    text: message.text
  }).catch(function(error) {
    console.log(error);
  }).then(function() {
    console.log("!!!!!");
  });

  console.log("end");
  // if (message.text.startsWith('雲')) {
  //   console.log("雲");
  // }
}

//app.use(bodyParser.json());
app.use('/.netlify/functions/server', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
