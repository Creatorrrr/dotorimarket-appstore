'use strict';

const express = require('express');
const { logger } = require('../configs/logger-config');
const Account = require('../models/account');

const router = express.Router();

router.post('', async (req, res, next) => {
  const account = new Account({
    accountId: req.body.accountId,
    password: req.body.password,
  });

  try {
    const result = await account.save();
    res.json({ result });
  } catch(err) {
    next(err);
  }
});

module.exports = router;
