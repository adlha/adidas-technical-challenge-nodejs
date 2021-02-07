const express = require('express');
const jwt = require('njwt');
const log = require('debug')('email-router');
const {tokenSecret} = require('../config');
const router = express.Router();

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

/* POST email */
router.post('/', verifyToken, (req, res, next) => {
  log(`Subscription ${req.body.subscription}`);
  res.status(201).send();
});

module.exports = router;
