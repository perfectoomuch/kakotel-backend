const express = require('express');
const router = express.Router();
const { setBooking, getUserBookings, getUserCustomers } = require('../../services/Booking.service')

router.post('/create', async (req, res) => {
  const data = await setBooking(req.headers.token, req.body);
  return res.status(data.status).json(data.json)
});

router.get('/bookings/renter', async (req, res) => {
  const data = await getUserBookings(req.headers.token);
  return res.status(data.status).json(data.json)
})

router.get('/bookings/landlord', async (req, res) => {
  const data = await getUserCustomers(req.headers.token);
  return res.status(data.status).json(data.json)
})

module.exports = router;