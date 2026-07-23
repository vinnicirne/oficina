const _ = require('lodash');

const tableName = 'transactions';

const transaction = {
  clientId: { type: 'string' },
  repairId: { type: 'string' }, // Opcional (se veio de uma O.S)
  descricao: { type: 'string' },
  valor: { type: 'number' },
  tipo: { type: 'string', enum: ['DEBT', 'PAYMENT'] }, // DEBT = Compra/Fatura, PAYMENT = Pagamento
  status: { type: 'string', enum: ['PENDING', 'PAID', 'OVERDUE'] },
  dataVencimento: { type: 'string', format: 'date-time' },
  dataPagamento: { type: 'string', format: 'date-time' },
  
  businessUnit: { type: 'string', enum: ['ELEVADORES', 'OFICINA', 'AMBOS'], 'm-default': 'ELEVADORES' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

const postSchema = {
  type: 'object',
  properties: _.cloneDeep(transaction),
  required: ['clientId', 'descricao', 'valor', 'tipo', 'status', 'businessUnit'],
};

const updateSchema = {
  type: 'object',
  properties: _.cloneDeep(transaction),
};

module.exports = {
  tableName,
  postSchema,
  updateSchema,
};
