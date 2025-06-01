const ipRangeCheck = require('ip-range-check');

const allowedRanges = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.154.128/25',
  '77.75.156.11',
  '77.75.156.35'
];

const isYookassa = async (req, res, next) => {
  const clientIp = req.headers['x-forwarded-for'];
  const isAllow = allowedRanges.some(range => ipRangeCheck(clientIp, range));
  if(!isAllow) return res.status(404).json('this route for only callback');
  next()
}

module.exports = isYookassa