const config = require('common/config/config');

const routes = (express, app, { user, client, access, role, repair, inventory, transaction }) => {
  const route = express.Router();

  route.post('/auth/login', user.validateLogin, access.performLogin);
  route.post('/auth/forgot-password', user.forgotPassword);
  route.post('/auth/reset-password', user.resetPassword);

  route.get('/users', access.verifyAuth(), user.populateTokenUser(), role.validateRole('users', 'read'), role.getNextLevelRoles, user.listUsers);
  route.post('/users', access.verifyAuth(true), user.populateTokenUser(true), user.registerUser);
  route.put('/users/:userId', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('users', 'update'), user.updateUser);
  route.put('/users/:userId/activate', user.populateParamsUserId, user.activateUser);
  route.put('/users/:userId/password', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('users', 'update'), user.updatePassword);
  route.put('/users/:userId/roles', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('users', 'delete'), role.getRole, user.updateRoles);
  route.get('/users/:userId', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('users', 'read'), user.showUser);
  route.delete('/users/:userId', access.verifyAuth(), user.populateParamsUserId, user.populateTokenUser(), role.validateRole('users', 'delete'), user.removeUser);

  route.get('/clients', access.verifyAuth(), user.populateTokenUser(), client.listClients);
  route.post('/clients', access.verifyAuth(), user.populateTokenUser(), client.createClient);
  route.put('/clients/:clientId', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), client.updateClient);
  route.get('/clients/:clientId', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), client.showClient);
  route.delete('/clients/:clientId', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), client.removeClient);

  route.get('/repairs', access.verifyAuth(), user.populateTokenUser(), role.validateRole('repairs', 'approve'), repair.listAllRepairs);
  route.get('/clients/:clientId/repairs', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), role.validateRole('repairs', 'read'), repair.listRepairs);
  route.post('/clients/:clientId/repairs', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), role.validateRole('repairs', 'write'), repair.addRepair);
  route.put('/clients/:clientId/repairs/:repairId', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), role.validateRole('repairs', 'update'), repair.verifyRepairOwner, repair.updateRepairByUser);
  route.put('/clients/:clientId/repairs/:repairId/manage', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), role.validateRole('repairs', 'approve'), repair.verifyRepairOwner, repair.updateRepairByManager);
  route.post('/clients/:clientId/repairs/:repairId/approve', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), repair.approveRepair);
  route.post('/clients/:clientId/repairs/:repairId/checkout', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), repair.checkoutRepair);
  route.get('/clients/:clientId/repairs/:repairId', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), role.validateRole('repairs', 'read'), repair.verifyRepairOwner, repair.showRepair);
  route.delete('/clients/:clientId/repairs/:repairId', access.verifyAuth(), client.populateParamsClientId, user.populateTokenUser(), role.validateRole('repairs', 'delete'), repair.verifyRepairOwner, repair.removeRepair);

  route.post('/roles', access.verifyAuth(), user.populateTokenUser(), role.validateRole('roles', 'write'), role.addRole);

  route.get('/inventories', access.verifyAuth(), user.populateTokenUser(), inventory.listInventories);
  route.post('/inventories', access.verifyAuth(), user.populateTokenUser(), inventory.createInventory);
  route.put('/inventories/:inventoryId', access.verifyAuth(), user.populateTokenUser(), inventory.updateInventory);
  route.get('/inventories/:inventoryId', access.verifyAuth(), user.populateTokenUser(), inventory.showInventory);
  route.delete('/inventories/:inventoryId', access.verifyAuth(), user.populateTokenUser(), inventory.removeInventory);

  route.get('/transactions', access.verifyAuth(), user.populateTokenUser(), transaction.getTransactions);
  route.post('/transactions', access.verifyAuth(), user.populateTokenUser(), transaction.addTransaction);
  route.put('/transactions/:transactionId/pay', access.verifyAuth(), user.populateTokenUser(), transaction.payTransaction);

  app.use(`/api/${config.server.version}`, route);
};

module.exports = routes;
