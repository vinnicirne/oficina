const config = require('common/config/config');
const mongooseSchema = require('common/helpers/mongooseSchema');

const User = require('models/user');
const userSchema = require('schema/user');
const Client = require('models/client');
const clientSchema = require('schema/client');
const Access = require('models/access');
const accessSchema = require('schema/access');
const Role = require('models/role');
const roleSchema = require('schema/role');
const Repair = require('models/repair');
const repairSchema = require('schema/repair');
const Equipment = require('models/equipment');
const equipmentSchema = require('schema/equipment');
const Inventory = require('models/inventory');
const inventorySchema = require('schema/inventory');
const Invoice = require('models/invoice');
const invoiceSchema = require('schema/invoice');
const Transaction = require('models/transaction');
const transactionSchema = require('schema/transaction');

module.exports = db => ({
  user: new User({
    db,
    schema: mongooseSchema(userSchema.postSchema),
    tableName: userSchema.tableName,
    salt: config.secret.passwordSalt,
    jsonSchema: userSchema,
  }),
  client: new Client({
    db,
    schema: mongooseSchema(clientSchema.postSchema),
    tableName: clientSchema.tableName,
    jsonSchema: clientSchema,
  }),
  access: new Access({
    db,
    schema: mongooseSchema(accessSchema.postSchema),
    tableName: accessSchema.tableName,
    signature: config.secret.jwtSignature,
    jsonSchema: accessSchema,
  }),
  role: new Role({
    db,
    schema: mongooseSchema(roleSchema.postSchema),
    tableName: roleSchema.tableName,
    jsonSchema: roleSchema,
  }),
  repair: new Repair({
    db,
    schema: mongooseSchema(repairSchema.postSchema),
    tableName: repairSchema.tableName,
    jsonSchema: repairSchema,
  }),
  equipment: new Equipment({
    db,
    schema: mongooseSchema(equipmentSchema.postSchema),
    tableName: equipmentSchema.tableName,
    jsonSchema: equipmentSchema,
  }),
  inventory: new Inventory({
    db,
    schema: mongooseSchema(inventorySchema.postSchema),
    tableName: inventorySchema.tableName,
    jsonSchema: inventorySchema,
  }),
  invoice: new Invoice({
    db,
    schema: mongooseSchema(invoiceSchema.postSchema),
    tableName: invoiceSchema.tableName,
    jsonSchema: invoiceSchema,
  }),
  transaction: new Transaction({
    db,
    schema: mongooseSchema(transactionSchema.postSchema),
    tableName: transactionSchema.tableName,
    jsonSchema: transactionSchema,
  }),
});
