const express = require('express');
const router = express.Router();
const { GLOBAL_INIT, getCityByValue } = require('../../services/Global.service')
const { formContact } = require('../../services/User.service')

router.get('/', async (req, res) => {
  const data = await GLOBAL_INIT();
  return res.status(200).json(data)
});

router.post('/form-contact', async (req, res) => {
  const data = await formContact(req.body);
  return res.status(data.status).json(data.json)
});

router.post('/search-city', async (req, res) => {
  const data = await getCityByValue(req.body.search);
  return res.status(data.status).json(data.json)
})

module.exports = router;