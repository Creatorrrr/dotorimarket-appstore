'use strict';

const mongoose = require('mongoose');
const { logger } = require('../configs/logger-config');
const DatabaseConfig = require('../configs/database-config');

let Account;

const getAccountModel = async () => {
  if (!Account) {console.log(DatabaseConfig.db.default)
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
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
  
    Account = conn.model('account', accountSchema);
  }

  return Account;
}

module.exports = getAccountModel;
