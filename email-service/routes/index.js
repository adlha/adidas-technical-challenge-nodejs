const express = require('express');
const emailsRouter = require('../routes/emails');
const router = express.Router();

router.use('/emails', emailsRouter);

module.exports = router;

