const _ = require('lodash');

const tableName = 'repairs';

const repair = {
  clientId: { type: 'string' }, // 'm-ref': 'users'
  equipmentId: { type: 'string' }, // 'm-ref': 'equipments'
  businessUnit: { type: 'string', enum: ['ELEVADORES', 'OFICINA'], 'm-default': 'ELEVADORES' },
  
  dataSolicitacao: { type: 'string' },
  dataAtendimento: { type: 'string' },
  dataFechamento: { type: 'string' },
  
  solicitadoPor: { type: 'string' },
  servicoSolicitado: { type: 'string' },
  defeitoInformado: { type: 'string' },
  defeitoConstatadoTecnico: { type: 'string' },
  obsSAT: { type: 'string' },
  observacao: { type: 'string' },
  
  chegada: { type: 'string' },
  saida: { type: 'string' },
  km: { type: 'number' },
  validadeOrcamento: { type: 'string' },
  tecnicoResponsavel: { type: 'string' }, // 'm-ref': 'users'
  
  status: { type: 'string', enum: ['ORCAMENTO', 'AGUARDANDO_APROVACAO', 'EM_EXECUCAO', 'CONCLUIDO', 'CANCELADO'] },
  
  materiais: { 
    type: 'array',
    items: {
      type: 'object',
      properties: {
        quantidade: { type: 'number' },
        descricao: { type: 'string' },
        precoUnitario: { type: 'number' },
        total: { type: 'number' }
      }
    }
  },
  
  comments: { type: 'array' }, // Keeping original comments functionality

  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

const postSchema = {
  type: 'object',
  properties: _.omit(repair, 'id'),
  required: ['clientId', 'servicoSolicitado'],
};

const updateSchema = {
  type: 'object',
  properties: _.omit(repair, ['clientId', 'createdAt', 'updatedAt']),
  additionalProperties: false,
};

const querySchema = {
  type: 'object',
  properties: _.omit(repair, []),
};

module.exports = {
  postSchema,
  updateSchema,
  tableName,
  querySchema,
};
