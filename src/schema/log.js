const _ = require('lodash');

const tableName = 'logs';

const log = {
  userId: { type: 'string' },
  userName: { type: 'string' },
  action: { type: 'string', enum: ['CREATE', 'UPDATE', 'DELETE', 'PAY', 'UNPAY'] },
  resource: { type: 'string', enum: ['CLIENT', 'REPAIR', 'TRANSACTION', 'USER', 'INVENTORY'] },
  resourceId: { type: 'string' },
  details: { type: 'string' },
  createdAt: { type: 'string', format: 'date-time' },
  businessUnit: { type: 'string' },
};

const postSchema = {
  type: 'object',
  properties: _.cloneDeep(log),
  required: ['userId', 'userName', 'action', 'resource', 'details'],
};

const querySchema = {
  type: 'object',
  properties: _.cloneDeep(log),
};

module.exports = {
  postSchema,
  tableName,
  querySchema,
};
