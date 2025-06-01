const mongoose = require('mongoose')
const Schema = mongoose.Schema

const tokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  token: {
    type: String,
    required: true
  },
  authed: Array,
  expired: {
    type: Date,
    required: true
  },
  extra: {
    type: Object,
    default: {}
  }
},
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
  { collection: 'tokens' }
)

const Token = mongoose.model('Token', tokenSchema)
module.exports = Token