const UserController = require('controllers/user');
const ClientController = require('controllers/client');
const AccessController = require('controllers/access');
const RoleController = require('controllers/role');
const RepairController = require('controllers/repair');
const InventoryController = require('controllers/inventory');
const TransactionController = require('controllers/transaction');

module.exports = models => ({
  user: new UserController(models.user),
  client: new ClientController(models.client),
  access: new AccessController(models.access),
  role: new RoleController(models.role),
  repair: new RepairController(models.repair),
  inventory: new InventoryController(models.inventory),
  transaction: new TransactionController(models),
});
