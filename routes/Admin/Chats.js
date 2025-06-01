const express = require('express');
const router = express.Router();
const { getAllRooms, getRoomByIdFromAdmin } = require('../../services/Chat.service')

router.get('/all', async (req, res) => {
  const data = await getAllRooms(req.query);
  return res.status(data.status).json(data.json)
})

router.get('/:id', async (req, res) => {
  const data = await getRoomByIdFromAdmin(req.params.id);
  return res.status(data.status).json(data.json)
})

module.exports = router;