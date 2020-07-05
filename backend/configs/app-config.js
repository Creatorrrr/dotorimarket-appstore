'use strict';

const env = require('../utils/env/env');

class AppConfig {}
AppConfig.APP_NAME = process.env.APP_NAME || env.app.name;

module.exports = AppConfig;
