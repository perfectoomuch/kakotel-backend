const Chat = require('../models/Chat')
const User = require('../models/User')
const { tokenVerify, tokenCreate } = require('./Token.service')
const { getSocketByUserId } = require('../socket')
const { createUserFromGuest } = require('./User.service')

const x_Room_Normolize = async (userId, room, lastMessage = false) => {
  const user = room.user_1._id == userId ? room.user_2 : room.user_1;
  const isOnline = await getSocketByUserId(user._id);

  const data = {
    _id: room._id,
    isOnline: (typeof isOnline) === 'string' ? true : false,
    user,
    unread: 0
  }

  if(lastMessage) {
    const last_message = room.chat[room.chat.length - 1];
    data.last_message = x_Room_Message_Type(last_message)

    return data;
  }

  return {
    _id: room._id,
    chat: room.chat,
    isOnline: (typeof isOnline) === 'string' ? true : false,
    user,
  }
}

const x_Room_Select = {
  email: 0, 
  phone: 0, 
  middle_name: 0, 
  birthday: 0, 
  balance: 0, 
  reviews: 0,
  wishlist: 0,
  password: 0
}

const x_Room_Message_Type = (chatItem) => {
  if(chatItem.status === 'pre-booking') return 'Запроса на бронирование'
  if(chatItem.status === 'invoice') return 'Выставлен счет'
  if(chatItem.status === 'attachments') return 'Вложения'
  if(chatItem.status === 'simple') {
    const limit = 27;
    if(chatItem.text.length > limit) return chatItem.text.slice(0, limit) + '...';
    return chatItem.text
  }
}

const createRoom = async (token, data) => {
  try {
    let userId = null;
    let isCreated = false;
    let chatId = null;
    let messageId = null;

    const searching = await User.exists({email: data.email}).lean().exec();
    if(searching) {
      if(token) {
        userId = await tokenVerify(token);
      } else {
        const user = await User.findOne({email: data.email}).lean().exec();
        userId = user._id.toString();
      }
    } else {
      const created = await createUserFromGuest(data);
      userId = created.json
      isCreated = true;
    }


    const roomExist = await Chat.findOne({
      user_1: userId,
      user_2: data._id
    });

    const message = {
      sender: userId,
      status: 'pre-booking',
      details: {
        estateId: data.estateId,
        adults: data.adults,
        childs: data.childs,
        date: data.date,
        comment: data.comment
      }
    }

    if(!roomExist) {
      const chat = new Chat({
        user_1: userId,
        user_2: data._id,
        chat: [
          message
        ]
      });

      await chat.save();

      chatId = chat._id;
      messageId = chat.chat[chat.chat.length - 1]._id
    } else {
      const pushing = await Chat.findOneAndUpdate(roomExist._id, {
        $push: { chat: message }
      }).lean().exec();

      chatId = pushing._id;
      messageId = pushing.chat[pushing.chat.length - 1]._id
    }

    if(!isCreated) return { status: 200, json: {
      chatId,
      messageId
    } }
    const tokenForNewUser = await tokenCreate(userId);
    return { status: 200, json: {
      token: tokenForNewUser,
      chatId,
      messageId
    }}
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on creating room' }
  }
}

const getUserRooms = async (token) => {
  try {
    const userId = await tokenVerify(token);
    
    const rooms = await Chat.find({
      $or: [
        { user_1: userId },
        { user_2: userId }
      ]
    }).populate([
      { path: 'user_1', select: x_Room_Select },
      { path: 'user_2', select: x_Room_Select }
    ]).sort('-updated_at').lean().exec();

    const rooms_with_status = await Promise.all(rooms.map(async el => {
      const room = await x_Room_Normolize(userId, el, true);
      return room
    }))

    return { status: 200, json: rooms_with_status };
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on parse user rooms' };
  }
}

const getRoomById = async (id, token) => {
  try {
    const userId = await tokenVerify(token);

    const room = await Chat.findById(id).populate([
      { path: 'user_1', x_Room_Select },
      { path: 'user_2', x_Room_Select }
    ]).lean().exec();

    const user_ids = [room.user_1._id.toString(), room.user_2._id.toString()];
    if(!user_ids.includes(userId)) return { status: 404, json: 'room not found' }

    const room_normolize = await x_Room_Normolize(userId, room)

    return { status: 200, json: room_normolize }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get room by id' }
  }
}

const getAllRooms = async (filter) => {
  try {
    const rooms = await Chat.find().populate('user_1 user_2').sort('-updated_at').lean().exec();
    let list = rooms;

    for (let index = 0; index < list.length; index++) {
      const el = list[index];
      let attachmentsCount = 0;
      let invoiceCount = 0;
      let invoicePaidCount = 0;

      for (let index = 0; index < el.chat.length; index++) {
        const message = el.chat[index];
        if(message.status === 'attachments') {
          attachmentsCount++
        }

        if(message.status === 'invoice') {
          invoiceCount++

          if(message.invoice?.paid === true) {
            invoicePaidCount++
          }
        }
      }

      list[index].counts = {
        attachmentsCount,
        invoiceCount,
        invoicePaidCount
      }
    }

    if(filter.userId) {
      list = list.filter(el => {
        const ids = [el.user_1._id.toString(), el.user_2._id.toString()];
        if(ids.includes(filter.userId)) {
          return true
        }
      })
    }

    if(filter.search) {
      const email = filter.search.trim();
      list = list.filter(el => el.user_1.email == email || el.user_2.email == email);
    }

    return { status: 200, json: list }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get rooms' }
  }
}

const getRoomByIdFromAdmin = async (id) => {
  try {
    const room = await Chat.findById(id).populate('user_1 user_2').lean().exec();

    let attachmentsCount = 0;
    let invoiceCount = 0;
    let invoicePaidCount = 0;

    for (let index = 0; index < room.chat.length; index++) {
      const message = room.chat[index];
      if(message.status === 'attachments') {
        attachmentsCount++
      }

      if(message.status === 'invoice') {
        invoiceCount++

        if(message.invoice?.paid === true) {
          invoicePaidCount++
        }
      }
    }

    room.counts = {
      attachmentsCount,
      invoiceCount,
      invoicePaidCount
    }

    return { status: 200, json: room }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get chat by id'}
  }
}

module.exports = {
  createRoom,
  getUserRooms,
  getRoomById,
  getAllRooms,
  getRoomByIdFromAdmin
}