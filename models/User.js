const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    default: ''
  },
  first_name: {
    type: String,
    default: ''
  },
  last_name: {
    type: String,
    default: ''
  },
  middle_name: {
    type: String,
    default: ''
  },
  birthday: {
    type: String,
    default: ''
  },
  wishlist: {
    type: Array,
    default: []
  },
  reviews: {
    type: Array,
    default: []
  },
  redirect_to_admin: {
    type: Boolean,
    default: true
  },
  balance: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['landlord', 'renter'],
    required: true
  }
},
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
  { collection: 'users' }
)

const User = mongoose.model('User', userSchema)
module.exports = User