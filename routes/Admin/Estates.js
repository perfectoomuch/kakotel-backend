const express = require('express');
const router = express.Router();
const {
  getAllEstates,
  setEstateStatus
} = require('../../services/Estate.service')

router.get('/all', async (req, res) => {
  const data = await getAllEstates(req.query);
  return res.status(data.status).json(data.json)
});

router.post('/status', async (req, res) => {
  const data = await setEstateStatus(req.body);
  return res.status(data.status).json(data.json)
})


module.exports = router;