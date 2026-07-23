const _ = require('lodash');

const tableName = 'clients';

const client = {
  firstName: { type: 'string' },
  lastName: { type: 'string' },
  email: { type: 'string', format: 'email' },
  phone: { type: 'string' },
  
  // Dados Pessoais / Empresa (SAT)
  cnpj: { type: 'string' },
  inscricaoEstadual: { type: 'string' },
  dataNascimento: { type: 'string' },
  businessUnit: { type: 'string', enum: ['ELEVADORES', 'OFICINA', 'AMBOS'], 'm-default': 'ELEVADORES' },
  limiteCredito: { type: 'number', 'm-default': 0 },
  historicoCredito: { 
    type: 'array',
    items: {
      type: 'object',
      properties: {
        data: { type: 'string', format: 'date-time' },
        valor: { type: 'number' },
        tipo: { type: 'string', enum: ['CREDITO', 'DEBITO'] },
        descricao: { type: 'string' }
      }
    }
  },
  
  // Endereço (SAT)
  endereco: { type: 'string' },
  numero: { type: 'string' },
  complemento: { type: 'string' },
  bairro: { type: 'string' },
  cidade: { type: 'string' },
  cep: { type: 'string' },
  uf: { type: 'string' },

  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' }
};

const postSchema = {
  type: 'object',
  properties: _.cloneDeep(client),
  required: ['firstName', 'lastName'],
};

const updateSchema = {
  type: 'object',
  properties: _.cloneDeep(client),
  additionalProperties: false,
};

const querySchema = {
  type: 'object',
  properties: _.cloneDeep(client),
};

module.exports = {
  updateSchema,
  postSchema,
  tableName,
  querySchema,
};
