const express = require('express');
const router = express.Router();
const {
  reviewCreate,
  reviewGetByEstate
} = require('../../services/Review.service')

router.post('/', async (req, res) => {
  const data = await reviewCreate(req.body);
  return res.status(data.status).json(data.json)
});

module.exports = router;