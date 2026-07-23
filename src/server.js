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
  require('dotenv').config();
  if (process.env.MONGODB_URI) {
    config.database.uri = process.env.MONGODB_URI;
    console.log('Using MongoDB from environment variable: ' + config.database.uri.split('@')[1]);
  } else {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({ binary: { version: '5.0.28' } });
      config.database.uri = mongod.getUri();
      console.log('Started MongoDB Memory Server at ' + config.database.uri);
    } catch(e) {
      console.log('Failed to start memory server, using fallback', e);
    }
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
       console.log('Admin default (oss@servicos.com) garantido com sucesso!');
    }).catch(e => console.log('Admin já existe ou erro no seed:', e.message));

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
