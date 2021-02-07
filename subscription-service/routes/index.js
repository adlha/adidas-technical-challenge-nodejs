const express = require('express');
const subscriptionsRouter = require('../routes/subscriptions');
const router = express.Router();

router.use('/subscriptions', subscriptionsRouter);

module.exports = router;

