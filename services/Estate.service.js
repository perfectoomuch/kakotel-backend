const Estate = require('../models/Estate')
const { tokenVerify } = require('./Token.service.js')
const { GLOBAL_INIT, CITIES_LIST } = require('./Global.service.js')
const { reviewGetByEstate } = require('./Review.service.js')

const createEstate = async (data, token) => {
  try {
    const userId = await tokenVerify(token);
    const estate = new Estate({
      ...data,
      user: userId
    });
    await estate.save();

    return { status: 200, json: 'created' }
  } catch (err) {
    console.log(err);
    return { status: 500, json: err }
  }
}

const getEstates = async (filter) => {
  try {
    const estates = await Estate.find({status: 'approved'}).sort('-created_at').lean().exec();
    
    let count = estates.length;
    let filtered = estates;

    if(filter?.category) {
      filtered = filtered.filter(el => el.category === filter.category);
      count = filtered.length;
    }

    if(filter?.city) {
      filtered = filtered.filter(el => el.address.city === filter.city);
      count = filtered.length;
    }

    if(filter?.show) {
      filtered = filtered.slice(0, parseInt(filter.show));
    }

    for (let index = 0; index < filtered.length; index++) {
      const el = filtered[index];
      const reviews = await reviewGetByEstate(el._id)
      const rating = reviews.json.rating;
      filtered[index].rating = rating;
    }

    return { status: 200, json: {
      list: filtered,
      count
    } }
  } catch (err) {
    console.log(err);
    return { status: err, json: err }
  }
}

const getEstateByID = async (id) => {
  try {
    const estate = await Estate.findById(id).populate({
      path: 'user',
      select: {
        email: 0,
        password: 0,
        wishlist: 0,
        balance: 0,
        phone: 0,
        birthday: 0,
      }
    }).lean().exec();
    if(!estate) return { status: 404, json: 'not found' }
    
    const { cities } = await GLOBAL_INIT();

    const foundCity = cities.find(el => el.value == estate.address.city);
    estate.address.city = foundCity.name

    const recomends = await Estate.find({
      "address.city": estate.address.city,
      category: estate.category
    }).populate({
      path: 'user',
      select: {
        email: 0,
        password: 0,
        wishlist: 0,
        balance: 0,
        phone: 0,
        birthday: 0,
      }
    }).lean().exec();

    const reviews = await reviewGetByEstate(estate._id)

    return { status: 200, json: {
      estate: {
        ...estate,
        reviews: reviews.json
      },
      recomends
    } }
  } catch (err) {
    console.log(err);
    return { status: 500, json: err }
  }
}

const getEstateCityName = async (city) => {
  const { cities } = await GLOBAL_INIT();

  const foundCity = cities.find(el => el.value == city);
  return foundCity.name
}

const getAllEstates = async (filter) => {
  try {
    const estates = await Estate.find().populate('user').sort('-created_at').lean().exec();
    let list = estates;

    if(filter.userId) {
      list = list.filter(el => el.user._id.toString() == filter.userId);
    }

    if(filter.approved) {
      let apporved = (/true/).test(filter.approved);
      list = list.filter(el => el.approved == apporved)
    }

    if(filter.category) {
      list = list.filter(el => el.category === filter.category)
    }

    if(filter.city) {
      list = list.filter(el => el.address.city === filter.city)
    }

    if(filter.search) {
      list = list.filter(el => el.user.email == filter.search)
    }

    for (let index = 0; index < list.length; index++) {
      const el = list[index];
      const reviews = await reviewGetByEstate(el._id)
      const rating = reviews.json.rating;
      list[index].rating = rating;
    }

    return { status: 200, json: list }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get all estates' }
  }
}

const setEstateStatus = async ({estateId, status}) => {
  try {
    const estate = await Estate.findByIdAndUpdate(estateId);
    if(!estate) return { status: 404, json: 'estate not found' };
    estate.status = status;
    await estate.save();

    return { status: 200, json: {} }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on update status' }    
  }
}

const getUserEstates = async (token) => {
  try {
    const userId = await tokenVerify(token);
    const estates = await Estate.find({user: userId}).lean().exec();
    return { status: 200, json: estates }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get user estates' }
  }
}

const getUserEstateByID = async (token, id) => {
  try {
    const userId = await tokenVerify(token);
    const estate = await Estate.findById(id).lean().exec();
    if(!estate) return { status: 404, json: 'estate not found' }
    if(estate.user.toString() !== userId.toString()) {
      return { status: 404, json: 'you are not object owner' }
    }

    const result = estate;
    delete result.created_at;
    delete result.updated_at;
    delete result.approved;
    delete result.status;
    delete result.reviews;
    delete result.user;
    delete result.comments;

    return { status: 200, json: result }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get estate by id for owner' }
  }
}

const updateUserEstate = async (token, data) => {
  try {
    const userId = await tokenVerify(token);
    const estate = await Estate.findById(data._id).lean().exec();
    if(estate.user.toString() !== userId.toString()) {
      return { status: 401, json: 'you are not object owner' }
    }

    const update = data;
    delete update._id;
    delete update.created_at;
    delete update.updated_at;
    delete update.approved;
    delete update.status;
    delete update.reviews;
    delete update.user;

    const estateUpdate = await Estate.findByIdAndUpdate(estate._id, {
      ...update,
      status: 'moderation'
    }, { new: true }).lean().exec();
    
    return { status: 200, json: 'estate info updated' }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on update estate info' }
  }
}



module.exports = {
  createEstate,
  getEstates,
  getEstateByID,
  getEstateCityName,
  getAllEstates,
  setEstateStatus,
  getUserEstates,
  getUserEstateByID,
  updateUserEstate,
}