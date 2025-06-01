const express = require('express');
const router = express.Router();
const { 
  createEstate, 
  getEstates,
  getEstateByID,
  getUserEstates,
  getUserEstateByID,
  updateUserEstate
} = require('../../services/Estate.service')
const isAuthed = require('../../middleware/isAuthed')

router.get('/', async (req, res) => {
  const data = await getEstates(req.query);
  return res.status(data.status).json(data.json)
})

router.post('/', async (req, res) => {
  const data = await createEstate(req.body, req.headers.token);
  return res.status(data.status).json(data.json)
});

router.get('/:id', async (req, res) => {
  const data = await getEstateByID(req.params.id);
  return res.status(data.status).json(data.json)
});

router.get('/user/estates/:id', async (req, res) => {
  const data = await getUserEstateByID(req.headers.token, req.params.id);
  return res.status(data.status).json(data.json)
})

router.get('/user/estates', isAuthed, async (req, res) => {
  const data = await getUserEstates(req.headers.token);
  return res.status(data.status).json(data.json)
});

router.post('/update/estate', isAuthed, async (req, res) => {
  const data = await updateUserEstate(req.headers.token, req.body);
  return res.status(data.status).json(data.json)
});

module.exports = router;