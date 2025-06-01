const Review = require('../models/Review');
const { RecaptchaV2 } = require('recaptcha-node');
const recaptchaV2 = new RecaptchaV2(process.env.RECAPTCHA_PRIVATE);

const reviewCreate = async (data) => {
  try {
    const token = await recaptchaV2.verify(data.token);
    if(token.success !== true) return { status: 401, json: 'captcha failed' }
    
    const review = new Review(data);
    await review.save();
    return { status: 200, json: 'review sent to moderation' }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on creating review' }
  }
}

const reviewGetByEstate = async (estateId) => {
  try {
    const reviews = await Review.find({estate_id: estateId, status: 'approved'}).sort('-created_at').lean().exec();
    let rating = 0;
    
    if(reviews.length != 0) {
      const normolized = reviews.map(el => {
        let email = el.email.split('@');
        let first_chars = email[0].substring(0,3);
        let last_chars_count = email[0].length - 3;
        for (let index = 0; index < last_chars_count; index++) {
          first_chars += '*'
        }

        return {
          ...el,
          email: `${first_chars}@${email[1]}`
        }
      })

      for (let index = 0; index < normolized.length; index++) {
        const el = normolized[index];
        rating += el.rating
      }

      return {
        status: 200, 
        json: {
          list: normolized,
          rating: (rating / normolized.length).toFixed(1)
        }
      }
    }
    
    return {
      status: 200,
      json: {
        list: [],
        rating: 0
      }
    }
    
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get estate reviews' }
  }
}

const reviewGetAll = async ({status}) => {
  try {
    const reviews = await Review.find({status}).populate('estate_id').sort('-created_at').lean().exec();
    return { status: 200, json: reviews }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on get all reviews' }
  }
}

const reviewStatusChange = async ({reviewId, status}) => {
  try {
    const review = await Review.findByIdAndUpdate(reviewId, { status }).lean().exec();
    return { status: 200, json: 'status updated' }
  } catch (err) {
    console.log(err);
    return { status: 500, json: 'error on update review status'}
  }
}

module.exports = {
  reviewCreate,
  reviewGetByEstate,
  reviewGetAll,
  reviewStatusChange
}