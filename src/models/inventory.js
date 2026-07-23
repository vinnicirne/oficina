const Promise = require('bluebird');
const _ = require('lodash');
const mongoose = require('mongoose');
const exceptions = require('common/exceptions');
const config = require('common/config/config');

class Inventory {
  constructor(options) {
    this.db = options.db;
    this.schema = new mongoose.Schema(options.schema);
    this.model = this.db.model(options.tableName, this.schema);
    this.jsonSchema = options.jsonSchema;
  }

  createInventory(input) {
    const data = _.cloneDeep(input);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    return (new this.model(data)).save().catch((err) => {
      throw new exceptions.DuplicateRecord([{ message: "Error creating inventory item" }]);
    });
  }

  updateInventory(inventoryId, input) {
    const updatedAt = { updatedAt: new Date().toISOString() };
    const data = _.cloneDeep(input);
    return this.model.findByIdAndUpdate(inventoryId, { $set: _.merge(updatedAt, data) }, _.merge({ new: true }, config.database.validation)).catch((err) => {
      throw new exceptions.DuplicateRecord([{ message: "Error updating inventory item" }]);
    });
  }

  queryInventory(input) {
    const query = _.cloneDeep(input);
    return this.model.find(query);
  }

  getInventory(inventoryId) {
    return this.model.findById(inventoryId).then((result) => {
      if (!result) throw new exceptions.NotFound();
      return result;
    });
  }

  deleteInventory(inventoryId) {
    return this.model.findByIdAndRemove(inventoryId).then((result) => {
      if (!result) throw new exceptions.NotFound();
      return result;
    });
  }
}

module.exports = Inventory;
