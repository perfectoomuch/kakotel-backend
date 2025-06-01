const express = require('express');
const router = express.Router();
const { updateBooking } = require('../../services/Booking.service')
const isYookassa = require('../../middleware/isYookassa')

router.use(isYookassa)

router.post('/yookassa', async (req, res) => {
  const data = await updateBooking(req.body)
  return res.status(200).json()
})

module.exports = router;