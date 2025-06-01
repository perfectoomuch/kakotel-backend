const express = require('express');
const router = express.Router();
const { getAllBookings } = require('../../services/Booking.service')

router.get('/all', async (req, res) => {
  const data = await getAllBookings(req.query);
  return res.status(data.status).json(data.json)
});


module.exports = router;