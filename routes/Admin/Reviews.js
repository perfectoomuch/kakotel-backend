const express = require('express');
const router = express.Router();
const { reviewGetAll, reviewStatusChange } = require('../../services/Review.service')

router.get('/', async (req, res) => {
  const data = await reviewGetAll(req.query);
  return res.status(data.status).json(data.json)
});

router.post('/status', async (req, res) => {
  const data = await reviewStatusChange(req.body);
  return res.status(data.status).json(data.json)
})

module.exports = router;