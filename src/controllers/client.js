const validator = require('common/helpers/validator');
const _ = require('lodash');
const Promise = require('bluebird');
const exceptions = require('common/exceptions');
const stringToQuery = require('common/helpers/stringToQuery');
const Serializer = require('common/serializer');
const config = require('common/config/config');

const serializer = new Serializer();

class ClientController {
  constructor(model, logModel) {
    this.model = model;
    this.logModel = logModel;
    this.jsonSchema = model.getJsonSchema();
    this.createClient = this.createClient.bind(this);
    this.listClients = this.listClients.bind(this);
    this.showClient = this.showClient.bind(this);
    this.updateClient = this.updateClient.bind(this);
    this.removeClient = this.removeClient.bind(this);
    this.populateParamsClientId = this.populateParamsClientId.bind(this);
  }

  createClient(req, res, next) {
    const body = _.cloneDeep(req.body);
    validator.buildParams({ input: body, schema: this.jsonSchema.postSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.postSchema }))
      .then(input => this.model.createClient(input))
      .then(result => {
        if(this.logModel && req.user) {
          this.logModel.addLog({ userId: req.user._id, userName: `${req.user.firstName} ${req.user.lastName}`, action: 'CREATE', resource: 'CLIENT', resourceId: result._id, details: `Criou cliente ${result.firstName}` }).catch(console.error);
        }
        return res.status(201).send(serializer.serialize(result, { type: 'clients' }));
      })
      .catch(error => next(error));
  }

  showClient(req, res, next) {
    this.model.getClient(req.params.clientId)
      .then(result => res.status(200).send(serializer.serialize(result, { type: 'clients' })))
      .catch(error => next(error));
  }

  listClients(req, res, next) {
    const query = stringToQuery(req.query.filter);
    const searchable = _.keys(this.jsonSchema.querySchema.properties);
    _.each(query.keys, (key) => {
      if (key !== '$or' && key !== '$and' && searchable.indexOf(key) === -1) throw new exceptions.InvalidInput();
    });
    const input = typeof (query.query) === 'string' ? JSON.parse(query.query) : query.query;
    
    if (req.query.businessUnit) {
      input.businessUnit = { $in: [req.query.businessUnit, 'AMBOS'] };
    }
    
    this.model.queryClient(input, _.merge({ sortby: 'updatedAt' }, _.pick(req.query, ['order', 'sortby', 'page', 'limit'])))
      .then((result) => {
        const pagination = { pagination: _.merge({ limit: config.listing.limit }, req.query), type: 'clients' };
        res.status(200).send(serializer.serialize(result, pagination));
      })
      .catch(error => next(error));
  }

  updateClient(req, res, next) {
    const body = _.cloneDeep(req.body);
    validator.buildParams({ input: body, schema: this.jsonSchema.updateSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.updateSchema }))
      .then(input => this.model.updateClient(req.clientId._id, input))
      .then(result => {
        if(this.logModel && req.user) {
          this.logModel.addLog({ userId: req.user._id, userName: `${req.user.firstName} ${req.user.lastName}`, action: 'UPDATE', resource: 'CLIENT', resourceId: result._id, details: `Atualizou cliente ${result.firstName}` }).catch(console.error);
        }
        return res.status(200).send(serializer.serialize(result, { type: 'clients' }));
      })
      .catch(error => next(error));
  }

  removeClient(req, res, next) {
    this.model.deleteClient(req.clientId._id)
      .then(() => {
        if(this.logModel && req.user) {
          this.logModel.addLog({ userId: req.user._id, userName: `${req.user.firstName} ${req.user.lastName}`, action: 'DELETE', resource: 'CLIENT', resourceId: req.clientId._id, details: `Removeu cliente` }).catch(console.error);
        }
        return res.status(204).send();
      })
      .catch(error => next(error));
  }

  populateParamsClientId(req, res, next) {
    this.model.getClient(req.params.clientId).then((clientData) => {
      if (!clientData) {
        next(new exceptions.NotFound());
      } else {
        req.clientId = clientData;
        next();
      }
    }).catch(error => next(error));
  }
}

module.exports = ClientController;
