'use strict';

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const DatabaseConfig = require('../configs/database-config');

let Application;

const getApplicationModel = async () => {
  if (!Application) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
    
    const applicationSchema = new mongoose.Schema({
      applicationId: {
        type: Number,
        unique: true,
      },
      name: {
        type: String,
      },
      version: {
        type: String,
      },
    }, {
      timestamps: true,
    });
    
    applicationSchema.plugin(autoIncrement.plugin, {
      model : 'application',
      field : 'applicationId',
      startAt : 1,
      increment : 1,
    });
  
    Application = conn.model('application', applicationSchema);
  }

  return Application;
}

module.exports = getApplicationModel;
