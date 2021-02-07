const express = require('express');
const request = require('request');
const jwt = require('njwt');
const log = require('debug')('subscriptions-router');
const {tokenSecret,
  services: {
    subscriptionService: {
      url: subscriptionServiceUrl,
      port: subscriptionServicePort,
    },
  },
} = require('../config');

const router = express.Router();
const fullSubscriptionServiceUrl = `http://${subscriptionServiceUrl}:${subscriptionServicePort}/subscriptions`;

function generateToken() {
  const claims = {iss: 'public-service', sub: 'publicSubscriptionService'};
  const token = jwt.create(claims, tokenSecret);
  token.setExpiration(new Date().getTime() + 60*1000);
  return token;
};

/* GET all subscriptions */
router.get('/', (req, res, next) => {
  const token = generateToken().compact();
  log(token);
  log(fullSubscriptionServiceUrl);
  const options = {
    method: 'GET',
    url: fullSubscriptionServiceUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    query: req.query,
    json: true,
  };
  request(options, (err, resp, body) => {
    if (err) {
      res.status(500).json({error: 'Server error'});
    } else if (!body) {
      res.status(resp.statusCode).send();
    } else {
      res.status(resp.statusCode).json(body);
    }
  });
});

/* GET subscription */
router.get('/:subscriptionId', (req, res, next) => {
  const token = generateToken().compact();
  const options = {
    method: 'GET',
    url: `${fullSubscriptionServiceUrl}/${req.params.subscriptionId}`,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    json: true,
  };
  request(options, (err, resp, body) => {
    log(err);
    log(resp);
    if (err) {
      res.status(500).json({error: 'Server error'});
    } else if (!body) {
      res.status(resp.statusCode).send();
    } else {
      res.status(resp.statusCode).json(body);
    }
  });
});

/* POST subscription */
router.post('/', (req, res, next) => {
  const token = generateToken().compact();
  const options = {
    method: 'POST',
    url: fullSubscriptionServiceUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: req.body,
    json: true,
  };
  request(options, (err, resp, body) => {
    if (err) {
      res.status(500).json({error: 'Server error'});
    } else if (!body) {
      res.status(resp.statusCode).send();
    } else {
      res.status(resp.statusCode).json(body);
    }
  });
});

/* DELETE subscription */
router.delete('/:subscriptionId', (req, res, next) => {
  const token = generateToken().compact();
  const options = {
    method: 'DELETE',
    url: `${fullSubscriptionServiceUrl}/${req.params.subscriptionId}`,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    json: true,
  };
  request(options, (err, resp, body) => {
    if (err) {
      res.status(500).json({error: 'Server error'});
    } else if (!body) {
      res.status(resp.statusCode).send();
    } else {
      res.status(resp.statusCode).json(body);
    }
  });
});

module.exports = router;
