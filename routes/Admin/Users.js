const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../../services/User.service')

router.get('/all', async (req, res) => {
  const data = await getAllUsers(req.query);
  return res.status(data.status).json(data.json);
});

router.get('/id/:id', async (req, res) => {
  const data = await getUserById(req.params.id);
  return res.status(data.status).json(data.json);
})

module.exports = router;