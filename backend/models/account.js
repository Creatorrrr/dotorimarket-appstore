'use strict';

const mongoose = require('mongoose');
const { logger } = require('../configs/logger-config');
const DatabaseConfig = require('../configs/database-config');

let Account;

const getAccountModel = async () => {
  if (!Account) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
    
    const accountSchema = new mongoose.Schema({
      accountId: {
        type: String,
        unique: true,
      },
      password: String,
      name: String,
      email: String,
      place: String,
    }, {
      timestamps: true,
    });
  
    Account = conn.model('account', accountSchema);
  }

  return Account;
}

module.exports = getAccountModel;
