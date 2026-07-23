class LogController {
  constructor(models) {
    this.models = models;
    this.logModel = models.log;
    
    this.getLogs = this.getLogs.bind(this);
    this.logActivity = this.logActivity.bind(this);
  }

  getLogs(req, res, next) {
    const query = {};
    if (req.query.businessUnit) query.businessUnit = req.query.businessUnit;
    
    this.logModel.queryLog(query)
      .then(logs => res.json(logs))
      .catch(next);
  }

  logActivity(userId, userName, action, resource, resourceId, details, businessUnit = 'OFICINA') {
    return this.logModel.addLog({
      userId,
      userName,
      action,
      resource,
      resourceId,
      details,
      businessUnit
    }).catch(e => console.error('Failed to log activity:', e));
  }
}

module.exports = LogController;
