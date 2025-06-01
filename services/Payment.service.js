const axios = require('axios')
const { v4: uuidv4 } = require('uuid');

const YOOKASSA_CREATE = async (order_id, chat_id, amount) => {
  const data = {
    "amount": {
      "value": amount,
      "currency": "RUB"
    },
    "capture": true,
    "confirmation": {
      "type": "redirect",
      "return_url": `https://kakotel.ru/account/?chat_id=${chat_id}`
    },
    "metadata": {
      "order_id": order_id
    }
  }

  const res = await axios.post('https://api.yookassa.ru/v3/payments', data, {
    headers: {
      'Idempotence-Key': uuidv4(),
      'Content-Type': 'application/json'
    },
    auth: {
      username: process.env.YOO_SHOPID,
      password: process.env.YOO_SECRET
    }
  });

  return res.data
}

module.exports = {
  YOOKASSA_CREATE
}