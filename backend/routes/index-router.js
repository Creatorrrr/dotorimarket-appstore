'use strict';

const express = require('express');
const HttpConfig = require('../configs/http-config');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/health', function(req, res, next) {
  res.status(HttpConfig.OK.statusCode).send();
});

module.exports = router;
