const UserController = require('controllers/user');
const ClientController = require('controllers/client');
const AccessController = require('controllers/access');
const RoleController = require('controllers/role');
const RepairController = require('controllers/repair');
const InventoryController = require('controllers/inventory');
const TransactionController = require('controllers/transaction');
const LogController = require('controllers/log');

module.exports = models => ({
  user: new UserController(models.user, models.log),
  client: new ClientController(models.client, models.log),
  access: new AccessController(models.access),
  role: new RoleController(models.role),
  repair: new RepairController(models.repair, models.log),
  inventory: new InventoryController(models.inventory, models.log),
  transaction: new TransactionController(models),
  log: new LogController(models),
});
