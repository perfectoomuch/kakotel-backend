const express = require('express');
const router = express.Router();
const { createRoom, getUserRooms, getRoomById } = require('../../services/Chat.service')
const isAuthed = require('../../middleware/isAuthed')

router.get('/', isAuthed, async (req, res) => {
  const data = await getUserRooms(req.headers.token);
  return res.status(data.status).json(data.json)
})

router.get('/:id', isAuthed, async (req, res) => {
  const data = await getRoomById(req.params.id, req.headers.token);
  return res.status(data.status).json(data.json)
})

router.post('/create', async (req, res) => {
  const data = await createRoom(req.headers.token, req.body);
  return res.status(data.status).json(data.json)
})

module.exports = router;