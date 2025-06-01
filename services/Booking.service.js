const Booking = require('../models/Booking');
const Chat = require('../models/Chat')
const { tokenVerify } = require('../services/Token.service')
const { YOOKASSA_CREATE } = require('./Payment.service')
const { getSocketByUserId } = require('../socket')

const setBooking = async (token, data) => {
  try {
    const customerId = await tokenVerify(token);

    const newBooking = new Booking({
      estate_id: data.invoice.estate._id,
      customer_id: customerId,
      landlord_id: data.invoice.estate.user,
      chat_id: data.chatId,
      messaged_id: data._id,
      period: data.invoice.period,
      total: data.invoice.total,
      fee_prepayment: data.invoice.fee,
    });

    await newBooking.save();
    
    const invoice = await YOOKASSA_CREATE(newBooking._id, newBooking.chat_id, newBooking.fee_prepayment);
    newBooking.invoice_create = invoice;

    await newBooking.save();

    return { status: 200, json: invoice.confirmation.confirmation_url }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on creating new booking post' }
  }
}

const updateBooking = async (data) => {
  try {
    const booking = await Booking.findByIdAndUpdate(data.object.metadata.order_id);
    if(data.object.status === 'succeeded') {
      booking.invoice_callback = data.object;
      booking.status = 'booked';
      
      await Chat.updateOne(
        { _id: booking.chat_id, 'chat._id': booking.messaged_id },
        { $set: { 'chat.$.invoice.paid': true } },
      )
      await booking.save();

      const current_chat = await Chat.findByIdAndUpdate(booking.chat_id).lean().exec();

      const sockets = [getSocketByUserId(current_chat.user_1), getSocketByUserId(current_chat.user_2)].filter(el => (typeof el) === 'string');
      global.io.to(sockets).emit('updateMessages');
    }
  } catch (err) {
    console.log(err);
  }
}

const getUserBookings = async (token) => {
  try {
    const userId = await tokenVerify(token);
    const bookings = await Booking.find({customer_id: userId}).populate([
      {
        path: 'estate_id',
        select: {
          description: 0
        }
      },
      {
        path: 'landlord_id',
        select: {
          first_name: 1,
          phone: 1,
          photo: 1
        }
      }
    ]).select({
      invoice_callback: {
        captured_at: 1,
        created_at: 1,
        id: 1,
        status: 1,
        paid: 1
      },
      chat_id: 1,
      messaged_id: 1,
      perod: 1,
      total: 1,
      fee_prepayment: 1,
      status: 1,
      created_at: 1
    }).sort('-created_at').lean().exec();

    return { status: 200, json: bookings }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on user bookings' }
  }
}

const getUserCustomers = async (token) => {
  try {
    const userId = await tokenVerify(token);
    const bookings = await Booking.find({landlord_id: userId}).populate([
      {
        path: 'estate_id',
        select: {
          description: 0
        }
      },
      {
        path: 'customer_id',
        select: {
          first_name: 1,
          phone: 1,
          photo: 1
        }
      }
    ]).select({
      invoice_callback: {
        captured_at: 1,
        created_at: 1,
        id: 1,
        status: 1,
        paid: 1
      },
      chat_id: 1,
      messaged_id: 1,
      perod: 1,
      total: 1,
      fee_prepayment: 1,
      status: 1,
      created_at: 1
    }).sort('-created_at').lean().exec();

    return { status: 200, json: bookings }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on user bookings' }
  }
}

const getAllBookings = async (filter) => {
  try {
    const bookings = await Booking.find({status: 'booked'}).populate('estate_id customer_id landlord_id').sort('-created_at').lean().exec();
    let list = bookings;

    if(filter.userId) {
      list = list.filter(el => {
        const ids = [el.customer_id._id.toString(), el.landlord_id._id.toString()];
        if(ids.includes(filter.userId)) {
          return true
        }
      })
    }

    if(filter.status) {
      list = list.filter(el => el.status === filter.status)
    }

    if(filter.search) {
      const email = filter.search.trim()
      list = list.filter(el => el.landlord_id.email == email || el.customer_id.email == email);
    }


    return { status: 200, json: list }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get bookings' }
  }
}

module.exports = {
  setBooking,
  updateBooking,
  getUserBookings,
  getUserCustomers,
  getAllBookings
}