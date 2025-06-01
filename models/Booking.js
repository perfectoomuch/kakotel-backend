const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bookingSchema = new Schema({
  estate_id: { type: Schema.Types.ObjectId, ref: 'Estate' },
  customer_id: { type: Schema.Types.ObjectId, ref: 'User' },
  landlord_id: { type: Schema.Types.ObjectId, ref: 'User' },
  chat_id: { type: Schema.Types.ObjectId, ref: 'Chat' },
  messaged_id: {
    type: Schema.Types.ObjectId
  },
  period: {
    type: Number,
    required: true
  },
  date: {
    from: String,
    to: String,
  },
  total: {
    type: Number,
    required: true,
  },
  fee_prepayment: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'booked', 'cancelled'],
    default: 'pending'
  },
  invoice_create: {
    type: Object,
    default: {}
  },
  invoice_callback: {
    type: Object,
    default: {}
  }
},
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
  { collection: 'bookings' }
)

const Booking = mongoose.model('Booking', bookingSchema)
module.exports = Booking