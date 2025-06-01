const Token = require('../models/Token')
const moment = require('moment')
const RandExp = require('randexp');
const { v4: uuidv4 } = require('uuid');

const tokenGenerate = () => {
  // const randString = new RandExp(/^[0-9]{15}[A-Z]{25}[A-Z]{25}$/).gen();
  
  const randString = new RandExp(/^[0-9]{10}[A-Z]{5}$/).gen();
  const uuid = uuidv4().replace(/[^a-zA-Z,0-9 ]/g, "").toUpperCase() + randString;
  return uuid;
}

const tokenCreate = async (userId) => {
  const token = new Token({
    user: userId,
    token: tokenGenerate(),
    expired: moment().add(3, 'days')
  });

  await token.save();
  return token.token;
}

const tokenVerify = async (token, getUser = false, select = {}) => {  
  const doc = await Token.findOne({token}).populate({
    path: 'user',
    select
  }).lean().exec();
  if(doc) {
    const currentDate = new Date().getTime();
    const tokenDate = new Date(doc.expired).getTime();
  
    if(tokenDate > currentDate) {
      if(getUser) {
        delete doc.password;
        return doc.user;
      } else {
        return doc.user._id.toString();
      }
    }

    await Token.findByIdAndRemove(doc._id);
    return false;
  }

  return false;
}

const tokenClear = async () => {
  const tokens = await Token.find().lean().exec();
  if(tokens.length == 0) return;
  const currentDate = new Date().getTime();
  tokens.map(doc => {
    const tokenDate = new Date(doc.expired).getTime();
    if(tokenDate < currentDate) {
      Token.findByIdAndRemove(doc._id);
    }
  })
}

module.exports = {
  tokenCreate,
  tokenVerify,
  tokenClear
}