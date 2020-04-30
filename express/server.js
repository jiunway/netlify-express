'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');

const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: "7XNzjdaY+siCxfSHDqrn1/nUeGvOnNbrJHXq+5M/6+ZqV/pUh/U7N81jbW3AkHLJCgsCxi7nWcOVVBPoCQIQxZQIpNF5mkAuHTTB6y6GCQYxgZVeqwGZWGwsEPCFAmUX59rEpWfY+NNdrGNOf+aKdAdB04t89/1O/w1cDnyilFU=",
  channelSecret: "40b8dc6da4c0bbf9dada7688aa38a32a",
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
  client.pushMessage("U161efffff21d107f1416e2d9529cff55", "test").catch(function(error) {
    console.log(error);
  });
});

router.post('/callback', line.middleware(config), (req, res) => {
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
  message.text = message.text.trim();
  if (message.text.startsWith('雲')) {
    console.log("雲");
    client.pushMessage("U161efffff21d107f1416e2d9529cff55", "test").catch(function(error) {
      console.log(error);
    });
  }
}

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
