const _ = require('lodash');

const tableName = 'users';

const user = {
  phone: { type: 'string' },
  password: { type: 'string', minLength: 5 },
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  email: { type: 'string', format: 'email', 'm-unique': true },
  status: { type: 'string', enum: ['GUEST', 'ACTIVE'] },
  roles: { type: 'string', 'm-default': 'cliente' },
  businessUnit: { type: 'string', enum: ['ELEVADORES', 'OFICINA', 'AMBOS'], 'm-default': 'ELEVADORES' },
  
  // Dados Pessoais / Empresa (SAT)
  cnpj: { type: 'string' },
  inscricaoEstadual: { type: 'string' },
  dataNascimento: { type: 'string' },
  limiteCredito: { type: 'number', 'm-default': 0 },
  creditScore: { type: 'number', 'm-default': 500 },
  diaVencimento: { type: 'number', 'm-default': 10 },
  creditStatus: { type: 'string', enum: ['ACTIVE', 'BLOCKED'], 'm-default': 'ACTIVE' },
  totalSpent: { type: 'number', 'm-default': 0 },
  
  // Endereço (SAT)
  endereco: { type: 'string' },
  bairro: { type: 'string' },
  cidade: { type: 'string' },
  cep: { type: 'string' },
  uf: { type: 'string' },

  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
  verification: { type: 'object' },
};

const postSchema = {
  type: 'object',
  properties: _.cloneDeep(user),
  required: ['firstName', 'lastName', 'email', 'password'],
};

const updateSchema = {
  type: 'object',
  properties: _.pick(user, ['firstName', 'lastName', 'email', 'phone']),
  anyOf: ['firstName', 'lastName', 'email', 'phone'].map(key => ({ required: [`${key}`] })),
  additionalProperties: false,
};

const updatePasswordSchema = {
  type: 'object',
  properties: { old: { type: 'string', minLength: 5 }, new: { type: 'string', minLength: 5 } },
  required: ['old', 'new'],
  additionalProperties: false,
};

const updateRolesSchema = {
  type: 'object',
  properties: _.pick(user, ['roles']),
  required: ['roles'],
  additionalProperties: false,
};

const resetPasswordSchema = {
  type: 'object',
  properties: _.merge({ code: { type: 'string' } }, _.pick(user, 'email')),
  required: ['email', 'code'],
  additionalProperties: false,
};

const forgotPasswordSchema = {
  type: 'object',
  properties: _.pick(user, ['email']),
  required: ['email'],
  additionalProperties: false,
};

const loginSchema = {
  type: 'object',
  properties: _.pick(user, ['email', 'password']),
  required: ['email', 'password'],
  additionalProperties: false,
};

const querySchema = {
  type: 'object',
  properties: _.omit(user, ['password', 'verification']),
};

module.exports = {
  updateSchema,
  postSchema,
  tableName,
  loginSchema,
  querySchema,
  updatePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateRolesSchema,
};
