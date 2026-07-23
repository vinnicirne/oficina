const Promise = require('bluebird');
const mongoose = require('mongoose');
const _ = require('lodash');

class Transaction {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.jsonSchema = options.jsonSchema;
  }

  addTransaction(input) {
    const data = _.cloneDeep(input);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    return (new this.model(data)).save();
  }

  updateTransaction(id, input) {
    input.updatedAt = new Date().toISOString();
    return this.model.findByIdAndUpdate(id, { $set: input }, { new: true });
  }

  getTransaction(id) {
    return this.model.findById(id);
  }

  queryTransaction(input) {
    return new Promise((resolve, reject) => {
      this.model.find(input).find((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  getJsonSchema() { return this.jsonSchema; }
}

module.exports = Transaction;
