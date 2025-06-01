const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = () => {
  return dayjs().tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss');
}