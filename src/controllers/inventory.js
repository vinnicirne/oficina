const validator = require('common/helpers/validator');
const _ = require('lodash');
const Promise = require('bluebird');
const exceptions = require('common/exceptions');
const stringToQuery = require('common/helpers/stringToQuery');
const Serializer = require('common/serializer');

const serializer = new Serializer();

class InventoryController {
  constructor(model) {
    this.model = model;
    this.jsonSchema = model.jsonSchema;
    this.createInventory = this.createInventory.bind(this);
    this.listInventories = this.listInventories.bind(this);
    this.showInventory = this.showInventory.bind(this);
    this.updateInventory = this.updateInventory.bind(this);
    this.removeInventory = this.removeInventory.bind(this);
  }

  createInventory(req, res, next) {
    const body = _.cloneDeep(req.body);
    validator.buildParams({ input: body, schema: this.jsonSchema.postSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.postSchema }))
      .then(input => this.model.createInventory(input))
      .then(result => res.status(201).send(serializer.serialize(result, { type: 'inventories' })))
      .catch(error => next(error));
  }

  showInventory(req, res, next) {
    this.model.getInventory(req.params.inventoryId)
      .then(result => res.status(200).send(serializer.serialize(result, { type: 'inventories' })))
      .catch(error => next(error));
  }

  listInventories(req, res, next) {
    const query = stringToQuery(req.query.filter);
    const searchable = _.keys(this.jsonSchema.querySchema.properties);
    const input = typeof (query.query) === 'string' ? JSON.parse(query.query) : query.query;
    
    if (req.query.businessUnit) {
      input.businessUnit = req.query.businessUnit;
    }

    validator.validate({ input, schema: this.jsonSchema.querySchema, skipRequired: true })
      .then(validInput => this.model.queryInventory(validInput))
      .then(result => res.status(200).send(serializer.serialize(result, { type: 'inventories' })))
      .catch(error => next(error));
  }

  updateInventory(req, res, next) {
    const data = req.body;
    validator.validate({ input: data, schema: this.jsonSchema.updateSchema })
      .then(input => this.model.updateInventory(req.params.inventoryId, input))
      .then(result => res.status(200).send(serializer.serialize(result, { type: 'inventories' })))
      .catch(error => next(error));
  }

  removeInventory(req, res, next) {
    this.model.deleteInventory(req.params.inventoryId)
      .then(() => res.status(204).send())
      .catch(error => next(error));
  }
}

module.exports = InventoryController;
