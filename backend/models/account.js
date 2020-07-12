'use strict';

const mongoose = require('mongoose');
const DatabaseConfig = require('../configs/database-config');

const accountSchema = new mongoose.Schema({
  accountId:  String,
  password: String,
});

const conn = DatabaseConfig.getConnection(DatabaseConfig.db.default);
const Account = conn.model('account', accountSchema);

module.exports = Account;
