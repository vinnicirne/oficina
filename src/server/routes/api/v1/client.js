const express = require('express');

module.exports = (controllers) => {
  const router = express.Router();

  /**
   * GET /api/v1/clients
   * Lists all clients
   */
  router.get('/', controllers.client.listClients);

  /**
   * POST /api/v1/clients
   * Creates a new client
   */
  router.post('/', controllers.client.createClient);

  /**
   * GET /api/v1/clients/:clientId
   * Shows a specific client
   */
  router.get('/:clientId', controllers.client.showClient);

  /**
   * PUT /api/v1/clients/:clientId
   * Updates a specific client
   */
  router.put('/:clientId', controllers.client.updateClient);

  /**
   * DELETE /api/v1/clients/:clientId
   * Deletes a specific client
   */
  router.delete('/:clientId', controllers.client.removeClient);

  // Parameter middleware
  router.param('clientId', controllers.client.populateParamsClientId);

  return router;
};
