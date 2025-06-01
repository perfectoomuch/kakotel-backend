const mongoose = require('mongoose')
const Schema = mongoose.Schema
const addCreatedAtPlugin = require('../plugins/addCreatedAtPlugin')

const reviewSchema = new Schema({
  estate_id: { type: Schema.Types.ObjectId, ref: 'Estate' },
  first_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['moderation', 'approved', 'cancelled'],
    default: 'moderation'
  },

},
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
  { collection: 'reviews' }
)

reviewSchema.plugin(addCreatedAtPlugin)

const Review = mongoose.model('Review', reviewSchema)
module.exports = Review