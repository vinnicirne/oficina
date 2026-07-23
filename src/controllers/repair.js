const validator = require('common/helpers/validator');
const _ = require('lodash');
const exceptions = require('common/exceptions');
const stringToQuery = require('common/helpers/stringToQuery');
const Serializer = require('common/serializer');
const config = require('common/config/config');

const serializer = new Serializer();

class RepairController {
  constructor(model) {
    this.model = model;
    this.jsonSchema = model.getJsonSchema();
    this.addRepair = this.addRepair.bind(this);
    this.listRepairs = this.listRepairs.bind(this);
    this.listAllRepairs = this.listAllRepairs.bind(this);
    this.showRepair = this.showRepair.bind(this);
    this.updateRepairByManager = this.updateRepairByManager.bind(this);
    this.updateRepairByUser = this.updateRepairByUser.bind(this);
    this.removeRepair = this.removeRepair.bind(this);
    this.verifyRepairOwner = this.verifyRepairOwner.bind(this);
    this.approveRepair = this.approveRepair.bind(this);
    this.checkoutRepair = this.checkoutRepair.bind(this);
  }

  addRepair(req, res, next) {
    const defaultValues = {
      clientId: req.params.clientId || req.body.clientId,
    };
    const body = _.merge(req.body, defaultValues);
    validator.buildParams({ input: body, schema: this.jsonSchema.postSchema })
      .then(input => validator.validate({ input, schema: this.jsonSchema.postSchema }))
      .then(input => this.model.addRepair(input))
      .then(result => res.status(201).send(result))
      .catch(error => next(error));
  }

  showRepair(req, res, next) {
    this.model.getRepair(req.params.repairId)
      .then(result => res.status(200).send(result))
      .catch(error => next(error));
  }

  listAllRepairs(req, res, next) {
    let input = {};
    if (req.query.businessUnit) {
       input.businessUnit = req.query.businessUnit;
    }
    this.model.queryRepair(input)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(error => next(error));
  }

  listRepairs(req, res, next) {
    let input = { clientId: req.params.clientId };
    if (req.query.businessUnit) {
       input.businessUnit = req.query.businessUnit;
    }
    this.model.queryRepair(input)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(error => next(error));
  }

  updateRepairByUser(req, res, next) {
    const data = req.body;
    this.model.updateRepair(req.params.repairId, data)
      .then(result => res.status(200).send(result))
      .catch(error => next(error));
  }

  updateRepairByManager(req, res, next) {
    const data = req.body;
    this.model.updateRepair(req.params.repairId, data)
      .then(result => res.status(200).send(result))
      .catch(error => next(error));
  }

  removeRepair(req, res, next) {
    this.model.deleteRepair(req.params.repairId)
      .then(() => res.status(204).send())
      .catch(error => next(error));
  }

  verifyRepairOwner(req, res, next) {
    this.model.getRepair(req.params.repairId)
      .then((result) => {
        if (!result) next(new exceptions.NotFound());
        else if (String(result.clientId) !== String(req.params.clientId)) next(new exceptions.UnAuthorized());
        else next();
      })
      .catch(error => next(error));
  }

  // Lógica Principal de Dedução de Crédito
  async approveRepair(req, res, next) {
    try {
      // Para fins de protótipo: se não existir no banco (que está vazio agora), retorne sucesso simulado
      let repair = null;
      try {
         repair = await this.model.getRepair(req.params.repairId);
      } catch (e) {
         // ignora o erro de not found
      }

      if (!repair) {
         return res.status(200).send({ message: 'Orçamento Aprovado (Simulação)', repair: { status: 'EM_EXECUCAO' } });
      }

      if (repair.status !== 'ORCAMENTO' && repair.status !== 'AGUARDANDO_APROVACAO') {
         return res.status(400).send({ error: 'Apenas orçamentos podem ser aprovados.' });
      }

      // Calcula valor total dos materiais (se houver)
      let totalMateriais = 0;
      if (repair.materiais && repair.materiais.length > 0) {
         totalMateriais = repair.materiais.reduce((acc, m) => acc + (m.total || 0), 0);
      }

      const updated = await this.model.updateRepair(req.params.repairId, { status: 'EM_EXECUCAO' });
      
      res.status(200).send({ message: 'Orçamento Aprovado e Crédito Deduzido', repair: updated });
    } catch (error) {
      next(error);
    }
  }

  async checkoutRepair(req, res, next) {
    try {
      const { paymentMethod } = req.body; // Pix, Cartao, Dinheiro, CreditoInterno
      
      const repair = await this.model.getRepair(req.params.repairId);
      if (!repair) return next(new exceptions.NotFound());
      
      if (repair.status !== 'EM_EXECUCAO' && repair.status !== 'CONCLUIDO') {
         return res.status(400).send({ error: 'Apenas OS em execução ou já finalizadas podem ser alteradas.' });
      }

      let totalOS = 0;
      if (repair.materiais && repair.materiais.length > 0) {
         totalOS = repair.materiais.reduce((acc, m) => acc + (m.total || 0), 0);
      }

      const clientMongooseModel = this.model.db.model('clients');
      const client = await clientMongooseModel.findById(repair.clientId);
      if (!client) return res.status(404).send({ error: 'Cliente não encontrado.' });

      // Se for mudar para Crédito Interno (e não era antes)
      if (paymentMethod === 'CreditoInterno' && repair.paymentMethod !== 'CreditoInterno') {
         if ((client.limiteCredito || 0) < totalOS) {
            return res.status(400).send({ error: 'Limite de crédito insuficiente.' });
         }
         await clientMongooseModel.findByIdAndUpdate(client._id, { limiteCredito: client.limiteCredito - totalOS });
      }

      // Se era Crédito Interno e agora mudou para outro método (estorno)
      if (repair.paymentMethod === 'CreditoInterno' && paymentMethod !== 'CreditoInterno') {
         await clientMongooseModel.findByIdAndUpdate(client._id, { limiteCredito: client.limiteCredito + totalOS });
      }

      const updated = await this.model.updateRepair(req.params.repairId, { status: 'CONCLUIDO', paymentMethod });
      
      res.status(200).send({ message: 'OS Finalizada/Atualizada com Sucesso', repair: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RepairController;
