const express = require('express');
const router = express.Router();
const isAdmin = require('../../middleware/isAdmin')

const Users = require('./Users.js')
const Chats = require('./Chats.js')
const Estates = require('./Estates.js')
const Bookings = require('./Bookings.js')
const Reviews = require('./Reviews.js')

router.use(isAdmin);
router.use('/users', Users)
router.use('/chats', Chats)
router.use('/estates', Estates)
router.use('/bookings', Bookings)
router.use('/reviews', Reviews)

module.exports = router;