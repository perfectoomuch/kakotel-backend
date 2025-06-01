const { tokenVerify } = require('../services/Token.service')

const isAdmin = async (req, res, next) => {
  const user = await tokenVerify(req.headers.token, true);
  if(user === false) return res.status(401).json('you are not authed');
  if(user._id != process.env.ADMIN_ID) return res.status(401).json('you are not admin');
  next()
}

module.exports = isAdmin