const Promise = require('bluebird');
const _ = require('lodash');
const mongoose = require('mongoose');
const exceptions = require('common/exceptions');
const config = require('common/config/config');

class Client {
  /**
   * Initializes Client model
   */
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.jsonSchema = options.jsonSchema;
  }

  /**
   * Creates a new client.
   */
  createClient(input) {
    const data = _.cloneDeep(input);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    return (new this.model(data)).save().catch((err) => {
      throw new exceptions.DuplicateRecord([{ message: "Error creating client" }]);
    });
  }

  /**
   * Updates the existing client.
   */
  updateClient(clientId, input) {
    const updatedAt = { updatedAt: new Date().toISOString() };
    const data = _.cloneDeep(input);
    return this.model.findByIdAndUpdate(clientId, { $set: _.merge(updatedAt, data) }, _.merge({ new: true }, config.database.validation)).catch((err) => {
      throw new exceptions.DuplicateRecord([{ message: "Error updating client" }]);
    });
  }

  /**
   * Removes a client record
   */
  deleteClient(clientId) {
    return this.model.findByIdAndRemove(clientId);
  }

  /**
   * Fetches a client record
   */
  getClient(clientId) {
    return this.model.findById(clientId);
  }

  /**
   * Queries client collection
   */
  queryClient(input, { page, limit = config.listing.limit, order, sortby } = {}) {
    return new Promise((resolve, reject) => {
      let query = this.model.find(input);
      if (Number(page) > 0) query = query.skip((limit || config.listing.limit) * (page - 1));
      if (Number(limit) > 0) query = query.limit(Number(limit));
      if (sortby) {
        _.each(sortby.split(','), (sortField) => {
          const sort = {};
          sort[sortField] = (order === 'asc' ? 1 : -1);
          query = query.sort(sort);
        });
      }
      query.find((err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   * Returns the JSON schema of this table
   */
  getJsonSchema() {
    return this.jsonSchema;
  }
}

module.exports = Client;
