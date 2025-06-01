const express = require('express');
const router = express.Router();
const { 
  createUser, 
  loginUser,
  restoreUser,
  getUser
} = require('../../services/User.service')
const isAuthed = require('../../middleware/isAuthed')

// get current user by token
router.get('/', isAuthed, async (req, res) => {
  const data = await getUser(req.headers.token);
  return res.status(data.status).json(data.json)
})

// create user
router.post('/sign-up', async (req, res) => {
  const data = await createUser(req.body);
  return res.status(data.status).json(data.json)
})

// login user
router.post('/sign-in', async (req, res) => {
  const data = await loginUser(req.body);
  return res.status(data.status).json(data.json)
});

router.post('/restore', async (req, res) => {
  const data = await restoreUser(req.body);
  return res.status(data.status).json(data.json)
})

module.exports = router;