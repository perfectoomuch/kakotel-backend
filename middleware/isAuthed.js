const { tokenVerify } = require('../services/Token.service')

const isAuthed = async (req, res, next) => {
  const user = await tokenVerify(req.headers.token);
  if(user === false) return res.status(401).json('you are not authed');

  next()
}

module.exports = isAuthed