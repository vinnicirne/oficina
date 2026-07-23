const _ = require('lodash');

const tableName = 'equipments';

const equipment = {
  clientId: { type: 'string', 'm-ref': 'users' }, // Reference to the User/Client
  businessUnit: { type: 'string', enum: ['ELEVADORES', 'OFICINA'], 'm-default': 'ELEVADORES' },
  tipo: { type: 'string' }, // Carro, Elevador, etc.
  marca: { type: 'string' },
  modelo: { type: 'string' },
  serie: { type: 'string' }, // Número de Série ou Placa
  fabricacao: { type: 'string' }, // Ano de Fabricação
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

const postSchema = {
  type: 'object',
  properties: _.cloneDeep(equipment),
  required: ['clientId', 'marca', 'modelo'],
};

const updateSchema = {
  type: 'object',
  properties: _.omit(equipment, ['clientId', 'createdAt', 'updatedAt']),
  additionalProperties: false,
};

const querySchema = {
  type: 'object',
  properties: _.omit(equipment, []),
};

module.exports = {
  updateSchema,
  postSchema,
  tableName,
  querySchema,
};
