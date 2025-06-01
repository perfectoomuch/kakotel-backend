const mongoose = require('mongoose')
const Schema = mongoose.Schema

const estateSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' }, 
  photos: [
    {
      name: String,
      title: String,
    }
  ],
  category: {
    type: String,
    required: true
  },
  address: {
    city: String,
    street: String,
    house: String,
    full: String
  },
  // сколько спальных комнат, душевых итд
  estate_info: {
    bedrooms: Number,
    showers: Number,
    area: Number
  },
  estate_comforts: {
    type: Array,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  price_week: {
    type: Number
  },
  reviews: {
    type: Array,
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  approved: {
    type: Boolean,
    default: false
  },
  comments: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['moderation', 'approved', 'cancelled'],
    default: 'moderation'
  }
},
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
  { collection: 'estates' }
)

const Estate = mongoose.model('Estate', estateSchema)
module.exports = Estate