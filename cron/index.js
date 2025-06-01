const cron = require('node-cron');
const { tokenClear } = require('../services/Token.service')

cron.schedule('0 0 0 * * *', function() {
  tokenClear()
});