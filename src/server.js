const express = require('express');
const bodyParser = require('body-parser');
const Connection = require('common/database/connection');
const models = require('models');
const controllers = require('controllers');
const routes = require('server/routes');
const logger = require('common/logger');
const middlewares = require('server/middlewares');
const config = require('common/config/config');
const mongoose = require('mongoose');

const app = express();

let dbConnection;

(async () => {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({ binary: { version: '5.0.28' } });
    config.database.uri = mongod.getUri();
    console.log('Started MongoDB Memory Server at ' + config.database.uri);
  } catch(e) {
    console.log('Failed to start memory server, using fallback', e);
  }

  dbConnection = new Connection(config.database);
  let dbModels;
  dbConnection.getModels = () => dbModels;

  dbConnection.connect().then(() => {
    app.use(bodyParser.json());
    app.all('/*', middlewares.enableCors);
    dbModels = models(dbConnection.db);

    // Seed seguro de usuário usando findOneAndUpdate
    console.log('--- EXECUTANDO SEED DE USUARIO ---');
    dbModels.role.addRole({
      name: 'manager',
      level: 1,
      permissions: ['users.read', 'users.write', 'users.update', 'users.delete', 'repairs.read', 'repairs.write', 'repairs.update', 'repairs.delete', 'repairs.approve']
    }).catch(() => {});
    
    dbModels.role.addRole({
      name: 'user',
      level: 5,
      permissions: ['repairs.read']
    }).catch(() => {});

    dbModels.user.createUser({ 
      email: 'oss@servicos.com', 
      password: '@@302010@@', 
      firstName: 'Admin', 
      lastName: 'Servicos', 
      roles: 'manager' 
    }, true).then(async (admin) => {
       await dbModels.user.updateUser(admin._id, { roles: 'manager' });
       console.log('Admin criado com role manager. Semeando clientes...');
       const cliente = await dbModels.user.createUser({
         email: 'carlos@cliente.com',
         password: '123',
         firstName: 'Carlos',
         lastName: 'Silva',
         roles: 'user',
         limiteCredito: 1500,
         dataNascimento: '1985-07-22'
       }, true);
       
       await dbModels.repair.addRepair({
         clientId: cliente._id.toString(),
         businessUnit: 'OFICINA',
         status: 'ORCAMENTO',
         servicoSolicitado: 'Troca de Pastilhas (Toyota Corolla DEF-5555)',
         materiais: [
           { descricao: 'Pastilha de Freio', quantidade: 1, precoUnitario: 450, total: 450 }, 
           { descricao: 'Mão de Obra', quantidade: 2, precoUnitario: 200, total: 400 }
         ]
       });
       console.log('Seed completo!');
    }).catch(e => console.log('Erro no seed (ignorável):', e.message));

    routes(express, app, controllers(dbModels));

    // If no route is matched by now, it must be a 404
    app.use(middlewares.noMatchingRoutes);

    // Error handler
    app.use(middlewares.errorHandler);

    // Start the server
    const server = app.listen(config.server.port, () => {
      logger.info(`Express server listening on port ${server.address().port}`);
    }).on('error', (err) => { });
  });
})();

module.exports = {
  app,
  get dbConnection() { return dbConnection; }
};
