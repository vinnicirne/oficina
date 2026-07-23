const Promise = require('bluebird');
const exceptions = require('common/exceptions');
const validator = require('common/helpers/validator');
const _ = require('lodash');

class TransactionController {
  constructor(models) {
    this.models = models;
    this.transactionModel = models.transaction;
    this.userModel = models.user;
    this.logModel = models.log;
    
    this.getTransactions = this.getTransactions.bind(this);
    this.addTransaction = this.addTransaction.bind(this);
    this.payTransaction = this.payTransaction.bind(this);
    this.unpayTransaction = this.unpayTransaction.bind(this);
    this.deleteTransaction = this.deleteTransaction.bind(this);
  }

  getTransactions(req, res, next) {
    const query = {
      businessUnit: req.query.businessUnit || 'OFICINA'
    };
    if (req.query.clientId) {
      query.clientId = req.query.clientId;
    }
    
    this.transactionModel.queryTransaction(query)
      .then(transactions => res.json(transactions))
      .catch(next);
  }

  addTransaction(req, res, next) {
    validator.validate({ input: req.body, schema: this.transactionModel.getJsonSchema().postSchema })
      .then(() => {
        return this.userModel.getUser(req.body.clientId);
      })
      .then(user => {
        if (!user) throw new exceptions.NotFound('Client not found');
        
        if (user.creditStatus === 'BLOCKED' && req.body.tipo === 'DEBT') {
          throw new exceptions.BadRequest('Cliente está com crédito bloqueado.');
        }

        const data = req.body;
        
        if (data.tipo === 'DEBT' && !data.dataVencimento) {
          const hoje = new Date();
          let v = new Date(hoje.getFullYear(), hoje.getMonth(), user.diaVencimento || 10);
          if (v < hoje) {
            v.setMonth(v.getMonth() + 1);
          }
          data.dataVencimento = v.toISOString();
        }
        
        if (data.tipo === 'DEBT') {
            data.status = 'PENDING';
        }

        return this.transactionModel.addTransaction(data);
      })
      .then(tx => {
         if (this.logModel && req.user) {
            this.logModel.addLog({ userId: req.user._id, userName: `${req.user.firstName} ${req.user.lastName}`, action: 'CREATE', resource: 'TRANSACTION', resourceId: tx._id, details: `Criou Fatura de R$ ${tx.valor}` }).catch(console.error);
         }
         return res.status(201).json(tx);
      })
      .catch(next);
  }

  payTransaction(req, res, next) {
    const transactionId = req.params.transactionId;
    let tx;
    this.transactionModel.getTransaction(transactionId)
      .then(t => {
        if (!t) throw new exceptions.NotFound();
        if (t.status === 'PAID') throw new exceptions.BadRequest('Fatura já está paga');
        
        tx = t;
        const pagoAtrasado = new Date() > new Date(tx.dataVencimento);
        
        return this.transactionModel.updateTransaction(transactionId, {
          status: 'PAID',
          dataPagamento: new Date().toISOString()
        }).then(() => pagoAtrasado);
      })
      .then(pagoAtrasado => {
        return this.userModel.getUser(tx.clientId).then(user => {
          if (!user) return;
          
          let score = user.creditScore || 500;
          if (pagoAtrasado) {
            score -= 100;
          } else {
            score += 50;
          }
          if (score > 1000) score = 1000;
          if (score < 0) score = 0;
          
          // Increment total spent when paid
          let totalSpent = (user.totalSpent || 0) + tx.valor;
          
          return this.userModel.updateUser(user._id, { creditScore: score, totalSpent });
        });
      })
      .then(() => {
         if (this.logModel && req.user) {
            this.logModel.addLog({ userId: req.user._id, userName: `${req.user.firstName} ${req.user.lastName}`, action: 'PAY', resource: 'TRANSACTION', resourceId: req.params.transactionId, details: `Registrou Pagamento` }).catch(console.error);
         }
         return res.json({ success: true });
      })
      .catch(next);
  }

  unpayTransaction(req, res, next) {
    const transactionId = req.params.transactionId;
    let tx;
    this.transactionModel.getTransaction(transactionId)
      .then(t => {
        if (!t) throw new exceptions.NotFound();
        if (t.status !== 'PAID') throw new exceptions.BadRequest('Fatura não está paga');
        
        tx = t;
        const pagoAtrasado = tx.dataPagamento && new Date(tx.dataPagamento) > new Date(tx.dataVencimento);
        
        return this.transactionModel.updateTransaction(transactionId, {
          status: 'PENDING',
          dataPagamento: null
        }).then(() => pagoAtrasado);
      })
      .then(pagoAtrasado => {
        return this.userModel.getUser(tx.clientId).then(user => {
          if (!user) return;
          
          let score = user.creditScore || 500;
          if (pagoAtrasado) {
            score += 100;
          } else {
            score -= 50;
          }
          if (score > 1000) score = 1000;
          if (score < 0) score = 0;
          
          let totalSpent = (user.totalSpent || 0) - tx.valor;
          if (totalSpent < 0) totalSpent = 0;
          
          return this.userModel.updateUser(user._id, { creditScore: score, totalSpent });
        });
      })
      .then(() => {
         if (this.logModel && req.user) {
            this.logModel.addLog({ userId: req.user._id, userName: `${req.user.firstName} ${req.user.lastName}`, action: 'UNPAY', resource: 'TRANSACTION', resourceId: req.params.transactionId, details: `Desfez o Pagamento` }).catch(console.error);
         }
         return res.json({ success: true });
      })
      .catch(next);
  }

  deleteTransaction(req, res, next) {
    const transactionId = req.params.transactionId;
    this.transactionModel.deleteTransaction(transactionId)
      .then(() => {
         if (this.logModel && req.user) {
            this.logModel.addLog({ userId: req.user._id, userName: `${req.user.firstName} ${req.user.lastName}`, action: 'DELETE', resource: 'TRANSACTION', resourceId: req.params.transactionId, details: `Removeu Fatura` }).catch(console.error);
         }
         return res.json({ success: true });
      })
      .catch(next);
  }
}

module.exports = TransactionController;
