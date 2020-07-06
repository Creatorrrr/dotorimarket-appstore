'use strict';

const env = require('../utils/env/env');

class FileConfig {}
FileConfig.FILE_PATH = process.env.FILE_PATH || env.file.path;

module.exports = FileConfig;
