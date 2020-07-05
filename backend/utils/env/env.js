'use strict';

const fs = require('fs');
const YAML = require('yaml');

const content = fs.readFileSync(`env-${process.env.NODE_ENV || 'development'}.yaml`, 'utf8');
const env = YAML.parse(content);

module.exports = env;
