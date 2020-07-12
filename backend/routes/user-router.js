'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const PassportConfig = require('../configs/passport-config');
const account = require('../models/account');

const router = express.Router();

router.get('/:userId', (req, res) => {
  const user = {
    userId: req.params.userId,
  }
  res.json(user);
});

router.post('', (req, res) => {
  const user = {
    userId: req.body.userId,
  };
  const token = jwt.sign(user, PassportConfig.JWT_SECRET);

  res.json({ user, token });
});

module.exports = router;
