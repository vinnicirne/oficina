const Promise = require('bluebird');
const mongoose = require('mongoose');
const _ = require('lodash');

class Log {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.jsonSchema = options.jsonSchema;
  }

  addLog(input) {
    const data = _.cloneDeep(input);
    data.createdAt = new Date().toISOString();
    return (new this.model(data)).save();
  }

  queryLog(input) {
    return new Promise((resolve, reject) => {
      this.model.find(input).sort({ createdAt: -1 }).limit(100).find((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  getJsonSchema() { return this.jsonSchema; }
}

module.exports = Log;
