const express = require('express');
const router = express.Router();
const isAuthed = require('../../middleware/isAuthed')

const {
  setUserStartData,
  updateUserData,
  getUserEstates,
  changePassword
} = require('../../services/User.service')

router.use(isAuthed)

router.post('/welcome', async (req, res) => {
  const data = await setUserStartData(req.body, req.headers.token);
  return res.status(data.status).json(data.json)
});

router.post('/update', async (req, res) => {
  const data = await updateUserData(req.headers.token, req.body);
  return res.status(data.status).json(data.json)
})

router.get('/estates', async (req, res) => {
  const data = await getUserEstates(req.headers.token);
  return res.status(data.status).json(data.json)
})

router.post('/password', async (req, res) => {
  const data = await changePassword(req.headers.token, req.body);
  return res.status(data.status).json(data.json)
})

module.exports = router;