const User = require('../models/User')
const Estate = require('../models/Estate')
const bcrypt = require('bcrypt')
const generator = require('generate-password');
const { tokenCreate, tokenVerify } = require('../services/Token.service')
const { getEstateCityName } = require('./Estate.service')
const { emailOnCreate, emailOnContact, emailOnRestore } = require('../email')

const createUser = async (data) => {
  try {
    const user = new User({
      ...data,
      password: bcrypt.hashSync(data.password, 10)
    });
    await user.save()
    const token = await tokenCreate(user._id);

    return {status: 200, json: token};
  } catch (err) {
    if(err.code == 11000) {
      return { status: 409, json: {} }
    }
    return {status: 405, json: err};
  }
}

const createUserFromGuest = async ({email, phone}) => {
  try {
    const password = generator.generate({
      length: 8,
      numbers: false
    });

    const user = new User({
      email,
      phone,
      password: bcrypt.hashSync(password, 10),
      role: 'renter'
    });

    await user.save();

    await emailOnCreate({email: user.email, password});

    return { status: 200, json: user._id.toString() }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on creating guest user' }
  }
}

const loginUser = async ({email, password}) => {
  try {
    const user = await User.findOne({email}).select('-reviews -redirect_to_admin').lean().exec();
    if(!user) return {status: 404, json: {}};
    if(!bcrypt.compareSync(password, user.password)) return {status: 401, json: {}};
    const token = await tokenCreate(user._id);
    return {status: 200, json: token};
  } catch (err) {
    console.log(err);
    return {status: 405, json: err};
  }
}

const restoreUser = async ({email}) => {
  try {
    const user = await User.findOne({email}).lean().exec();
    if(!user) return { status: 404, json: 'user not found' }
    const password = generator.generate({
      length: 8,
      numbers: false
    });
    await User.findByIdAndUpdate(user._id, { password: bcrypt.hashSync(password, 10)}).lean().exec();
    await emailOnRestore({email, password});

    return { status: 200, json: 'new password has been sent' }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on change user password' }
  }
}

const getUser = async (token) => {
  const user = await tokenVerify(token, true);
  
  if(typeof user !== 'boolean') {
    let userData = user;
    const approvedEstates = await Estate.find({user: user._id, approved: true}).lean();
    userData.approved_esatates = approvedEstates.length;
    
    if(user._id == process.env.ADMIN_ID) return {status: 200, json: {...userData, role: 'admin'}};
    return {status: 200, json: userData};
  } else {
    return {status: 401, json: 'token is invalid or expired'};
  }
}

const setUserStartData = async ({first_name, last_name, middle_name, birthday, phone}, token) => {
  try {
    const userId = await tokenVerify(token);
    const user = await User.findByIdAndUpdate(userId, {
      first_name,
      last_name,
      middle_name,
      birthday,
      phone
    }).lean().exec();

    return { status: 200, json: 'updated' }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error' }
  }
}

const updateUserData = async (token, data) => {
  try {
    const userId = await tokenVerify(token);
    const user = await User.findByIdAndUpdate(userId, data);
    return { status: 200, json: 'updated' }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on updating user data'}
  }
}

const getUserEstates = async (token) => {
  try {
    const userId = await tokenVerify(token);
    const estates = await Estate.find({user: userId}).lean().exec();

    const with_city = await Promise.all(estates.map(async el => {
      const cityname = await getEstateCityName(el.address.city);
      return {
        ...el,
        address: {
          ...el.address,
          city: cityname
        }
      }
    }))

    return { status: 200, json: with_city }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get user estates' }
  }
}

const changePassword = async (token, data) => {
  try {
    const userId = await tokenVerify(token);
    const user = await User.findById(userId).lean().exec();

    if(bcrypt.compareSync(data.old, user.password)) {
      if(data.new !== data.new_repeat) return { status: 405, json: 'new passwords do not match' };
      await User.findByIdAndUpdate(userId, { password: bcrypt.hashSync(data.new_repeat, 10)});

      return { status: 200, json: 'password updated' }
    }

    return { status: 401, json: 'wrong old password' }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on changing new password' }
  }
}

const getAllUsers = async (filter) => {
  try {
    const users = await User.find().sort('-created_at').lean().exec();
    let list = users;

    if(filter.role) {
      list = list.filter(el => el.role === filter.role);
    }

    if(filter.search) {
      const email = filter.search.trim();
      list = list.filter(el => el.email == email)
    }

    if(filter.phone) {
      list = list.filter(el => el.phone == filter.phone)
    }


    return { status: 200, json: list }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get all users' }
  }
}

const getUserById = async (id) => {
  try {
    if(!id) return { status: 404, json: 'user not found' }
    
    const user = await User.findById(id).lean().exec();
    if(!user) return { status: 404, json: 'user not found' }

    return { status: 200, json: user }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get user' }
  }
}

const formContact = async (data) => {
  try {
    const sending = await emailOnContact(data);
    return { status: 200, json: 'success sent' }    
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on sending contact form' }    
  }
}

module.exports = {
  createUser,
  loginUser,
  restoreUser,
  getUser,
  setUserStartData,
  updateUserData,
  getUserEstates,
  createUserFromGuest,
  changePassword,
  getAllUsers,
  getUserById,
  formContact
}
