'use strict';

const mongoose = require('mongoose');
const DatabaseConfig = require('../configs/database-config');

mongoose.set('useCreateIndex', true)

const accountSchema = new mongoose.Schema({
  accountId: {
    type: String,
    unique: true,
  },
  password: String,
  name: String,
  email: String,
});

const conn = DatabaseConfig.getConnection(DatabaseConfig.db.default);
const Account = conn.model('account', accountSchema);

module.exports = Account;
