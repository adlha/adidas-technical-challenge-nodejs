const express = require('express');
const request = require('request');
const {checkSchema, validationResult} = require('express-validator');
const jwt = require('njwt');
const {waterfall} = require('async');
const log = require('debug')('subscription-router');
const SubscriptionCollection = require('../model/SubscriptionCollection');
const {tokenSecret,
  services: {
    emailService: {
      url: emailServiceUrl,
      port: emailServicePort,
    },
  },
} = require('../config');


const router = express.Router();
const subscriptionColl = new SubscriptionCollection();
const fullEmailServiceUrl = `http://${emailServiceUrl}:${emailServicePort}/emails`;

const subscriptionPostSchema = {
  email: {
    in: ['body'],
    isEmail: true,
    errorMessage: 'Must specify a valid email (example@example.com)',
  },
  newsletterId: {
    in: ['body'],
    exists: {
      errorMessage: 'Must specify a newsletterId',
    },
  },
  firstName: {
    in: ['body'],
    optional: {options: {nullable: true}},
  },
  gender: {
    in: ['body'],
    isIn: {
      options: [['M', 'F', 'N/A']],
      errorMessage: 'Invalid gender (M, F, N/A)',
    },
    optional: {options: {nullable: true}},
  },
  dateOfBirth: {
    in: ['body'],
    isDate: true,
    errorMessage: 'Must specify a valid date of birth (yyyy-MM-dd)',
  },
  consentFlag: {
    in: ['body'],
    isBoolean: true,
    errorMessage: 'Must specify a valid value for flag of consent (true/false)',
  },
};

function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, tokenSecret, (err, verifiedJwt) => {
      if (err) {
        res.status(401).send();
      } else {
        req.params.token = verifiedJwt;
        next();
      }
    });
  } else {
    res.status(401).send();
  }
}

/* GET all subscriptions */
router.get('/', verifyToken, (req, res, next) => {
  subscriptionColl.getAllSubscriptions(req.query, (err, result) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).json(result);
    }
  });
});

/* GET subscription */
router.get('/:subscriptionId', verifyToken, (req, res, next) => {
  const subscriptionId = req.params.subscriptionId;
  if (!subscriptionId || subscriptionId.length == 0) {
    res.status(400).json({
      error: 'Please specify subscriptionId',
      timestamp: new Date().toLocaleString(),
    });
  } else {
    subscriptionColl.getSubscription(subscriptionId, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (!result) {
        res.status(404).json({
          error: 'Subscription not found',
          timestamp: new Date().toLocaleString(),
        });
      } else {
        res.status(200).json(result);
      }
    });
  }
});

/* POST subscription */
router.post('/', verifyToken, checkSchema(subscriptionPostSchema), (req, res, next) => {
  const token = req.params.token;
  const body = {
    email: req.body.email,
    firstName: req.body.firstName,
    gender: req.body.gender,
    dateOfBirth: req.body.dateOfBirth,
    newsletterId: req.body.newsletterId,
    consentFlag: req.body.consentFlag,
  };
  const bodyErrors = validationResult(req).array();
  if (bodyErrors.length == 0) {
    waterfall([

      (nextW) => {
        subscriptionColl.createSubscription(body, nextW);
      },

      (result, nextW) => {
        const options = {
          method: 'POST',
          url: fullEmailServiceUrl,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: {
            subscription: body,
            emailBody: 'Subscription completed',
          },
          json: true,
        };
        request(options, (err) => {
          if (err) {
            nextW({error: 'COULD_NOT_SEND_EMAIL'}, result);
          } else {
            nextW(null, result);
          }
        });
      },

    ], (err, result) => {
      if (err && err.error == 'ALREADY_EXISTS') {
        res.status(400).send({
          error: 'Subscription already exists',
          timestamp: new Date().toLocaleString(),
        });
      } else if (err && err.error == 'COULD_NOT_SEND_EMAIL') {
        res.status(201).json({
          subscriptionId: result.subscriptionId,
          warning: 'Could not send email notification',
        });
      } else if (err) {
        res.status(500).send(err);
      } else {
        res.status(201).send(result);
      }
    });
  } else {
    res.status(400).json({
      error: bodyErrors,
      timestamp: new Date().toLocaleString(),
    });
  }
});


/* DELETE subscription */
router.delete('/:subscriptionId', verifyToken, (req, res, next) => {
  const subscriptionId = req.params.subscriptionId;
  if (!subscriptionId || subscriptionId.length == 0) {
    res.status(400).json({
      error: 'Please specify subscriptionId',
      timestamp: Date.now().toString(),
    });
  } else {
    subscriptionColl.deleteSubscription(subscriptionId, (err, result) => {
      if (err) {
        res.status(500).send(err);
      } else if (result.countRemoved == 0) {
        res.status(404).json({
          error: 'Subscription not found',
          timestamp: new Date().toLocaleString(),
        });
      } else {
        res.status(204).send();
      }
    });
  }
});

module.exports = router;
