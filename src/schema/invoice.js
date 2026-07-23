const _ = require('lodash');

const tableName = 'invoices';

const invoice = {
  businessUnit: { type: 'string', enum: ['ELEVADORES', 'OFICINA'], 'm-default': 'ELEVADORES' },
  clientId: { type: 'string' },
  repairId: { type: 'string' }, // Relacionado à Ordem de Serviço / SAT
  valorTotal: { type: 'number' },
  condicoesPagamento: { type: 'string' },
  status: { type: 'string', enum: ['ABERTA', 'PAGA', 'ATRASADA', 'CANCELADA'], 'm-default': 'ABERTA' },
  dataVencimento: { type: 'string', format: 'date' },
  dataPagamento: { type: 'string', format: 'date' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

const postSchema = {
  type: 'object',
  properties: _.cloneDeep(invoice),
  required: ['clientId', 'repairId', 'valorTotal', 'status'],
};

const updateSchema = {
  type: 'object',
  properties: _.omit(invoice, ['createdAt', 'updatedAt']),
  additionalProperties: false,
};

const querySchema = {
  type: 'object',
  properties: _.omit(invoice, []),
};

module.exports = {
  updateSchema,
  postSchema,
  tableName,
  querySchema,
};
