const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatSchema = new Schema({
  user_1: { type: Schema.Types.ObjectId, ref: 'User' },
  user_2: { type: Schema.Types.ObjectId, ref: 'User' },
  chat: [
    {
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      text: String,
      details: Object,
      attachments: Array,
      status: String,
      invoice: Object,
      isAdmin: {
        type: Boolean,
        default: false
      },
      date: {
        type: Date,
        default: Date.now()
      }
    }
  ],
},
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
  { collection: 'chats' }
)

const Chat = mongoose.model('Chat', chatSchema)
module.exports = Chat