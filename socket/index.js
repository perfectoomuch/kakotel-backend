const User = require('../models/User')
const Chat = require('../models/Chat')
const Estate = require('../models/Estate')
const { tokenVerify } = require('../services/Token.service')
const { getEstateCityName } = require('../services/Estate.service')

const users = [];

const x_Room_Normolize = async (userId, room, lastMessage = false) => {
  const user = room.user_1._id.toString() == userId.toString() ? room.user_2 : room.user_1;

  const isOnline = await getSocketByUserId(user._id);

  return {
    _id: room._id,
    user: {
      _id: user._id,
      email: user.email
    },
    isOnline: (typeof isOnline) === 'string' ? true : false,
  }
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

const x_Room_Select = {
  // email: 0, 
  phone: 0, 
  middle_name: 0, 
  birthday: 0, 
  balance: 0, 
  reviews: 0,
  wishlist: 0,
  password: 0
}

const getUserRooms = async (userId) => {
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
  }));

  return rooms_with_status
}

const addUser = async ({socketId, token}) => {
  const user = await tokenVerify(
    token, 
    true,
    {
      email: 0, 
      phone: 0, 
      middle_name: 0, 
      birthday: 0, 
      balance: 0, 
      reviews: 0,
      wishlist: 0,
      password: 0
    }
  );

  const exists = users.some(el => el._id.toString() === user._id.toString());
  if(exists) return user._id;
  users.push({...user, socketId});
  return user._id;
}

const updateStatus = async (userId) => {
  const rooms = await getUserRooms(userId);
  const sockets = rooms.map(el => getSocketByUserId(el.user._id));

  return sockets
}

const deleteUser = (id) => {
  const userIndex = users.findIndex(el => el.socketId == id);
  if(userIndex > -1) users.splice(userIndex, 1);
}

const getSocketByUserId = (userId) => {
  const found = users.find(el => el._id.toString() == userId.toString());
  if(found) {
    return found.socketId;
  }

  return false
}

const getUserBySocketId = (socketId) => {
  const user = users.find(el => el.socketId == socketId);
  if(user) return user;
  return false;
}

const pushMessage = async (userId, chatId, message) => {
  const room = await Chat.findByIdAndUpdate(chatId)
  let status = '';
  let estate = null;
  let isAdmin = false;

  if(message?.status) {
    status = message.status
  } else {
    if(message.attachments.length > 0) {
      status = 'attachments'
    } else {
      status = 'simple'
    }
  }

  if(message?.invoice) {
    estate = await Estate.findById(message.invoice.estateId).lean().exec();
    estate.address.city = await getEstateCityName(estate.address.city)
  }

  if(userId.toString() === process.env.ADMIN_ID) {
    isAdmin = true
  }

  room.chat.push({
    sender: userId,
    text: message.text,
    attachments: message.attachments,
    status: status,
    isAdmin,
    invoice: {
      ...message.invoice,
      estate,
      paid: false
    }
  });

  await room.save()
  const last_message_body = room.chat[room.chat.length - 1];
  const last_message_preview = x_Room_Message_Type(last_message_body);

  return {
    body: last_message_body,
    preview: last_message_preview
  }
}

const getAdminSocketId = () => {
  const admin_id = process.env.ADMIN_ID;
  const found = users.find(el => el._id.toString() == admin_id);
  if(found) return found.socketId;
  return false;
}

const Socket = async (io) => {
  io.use(async (socket, next) => {
    const userId = await tokenVerify(socket.handshake.auth.token);

    if(userId) next();
  });

  io.on('connection', (socket) => {
    socket.on('addUser', async () => {
      const userId = await addUser({socketId: socket.id, token: socket.handshake.auth.token});
      const sockets = await updateStatus(userId);
      const rooms = await getUserRooms(userId);
      io.to(sockets).emit('update', rooms);
      
    });

    socket.on("message", async (data) => {
      const token = socket.handshake.auth.token;
      const userId = await tokenVerify(token);
      const message = await pushMessage(userId, data.chatId, data.form);
      const room = await Chat.findById(data.chatId).lean().exec();
      const secondUserId = userId.toString() == room.user_1.toString() ? room.user_2 : room.user_1
      const socketIds = [getSocketByUserId(room.user_1), getSocketByUserId(room.user_2)].filter(el => (typeof el) === 'string');

      const response = {
        _id: room._id,
        ...message
      }

      const adminId = getAdminSocketId();
      if(adminId) {
        socketIds.push(adminId);
      }

      io.to(socketIds).emit("message", response)
      console.log(socketIds);
    })
 
    socket.on("disconnect", async () => {
      const user = await getUserBySocketId(socket.id);
      if(user) {
        const sockets = await updateStatus(user._id);
        const rooms = await getUserRooms(user._id);
        io.to(sockets).emit('update', rooms.map(el => ({...el, isOnline: false})));
      }

      deleteUser(socket.id);
      console.log('user disconnected');
    });
  });
}

module.exports = {
  Socket,
  getSocketByUserId
}