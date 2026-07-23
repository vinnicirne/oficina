const _ = require('lodash');

const tableName = 'inventories';

const inventory = {
  businessUnit: { type: 'string', enum: ['ELEVADORES', 'OFICINA'], 'm-default': 'ELEVADORES' },
  codigoSku: { type: 'string' },
  descricao: { type: 'string' },
  quantidade: { type: 'number' },
  quantidadeMinima: { type: 'number', 'm-default': 5 },
  valorCusto: { type: 'number' },
  valorVenda: { type: 'number' },
  categoria: { type: 'string' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

const postSchema = {
  type: 'object',
  properties: _.cloneDeep(inventory),
  required: ['descricao', 'quantidade', 'valorVenda'],
};

const updateSchema = {
  type: 'object',
  properties: _.omit(inventory, ['createdAt', 'updatedAt']),
  additionalProperties: false,
};

const querySchema = {
  type: 'object',
  properties: _.omit(inventory, []),
};

module.exports = {
  updateSchema,
  postSchema,
  tableName,
  querySchema,
};
