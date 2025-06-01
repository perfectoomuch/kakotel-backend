const Auth = require('./routes/Client/Auth')
const Upload = require('./routes/Client/Upload')
const Global = require('./routes/Client/Global')
const Estate = require('./routes/Client/Estate')
const User = require('./routes/Client/User')
const Chat = require('./routes/Client/Chat')
const Callback = require('./routes/Client/Callback')
const Booking = require('./routes/Client/Booking')
const Review = require('./routes/Client/Review')
const Admin = require('./routes/Admin/index')

const simplePath = (name) => {
  return `/api/${name}`
}

module.exports = (app) => {
  app.use(simplePath('auth'), Auth);
  app.use(simplePath('upload'), Upload);
  app.use(simplePath('global'), Global);
  app.use(simplePath('estate'), Estate);
  app.use(simplePath('user'), User);
  app.use(simplePath('chat'), Chat);
  app.use(simplePath('callback'), Callback);
  app.use(simplePath('booking'), Booking);
  app.use(simplePath('review'), Review);
  app.use(simplePath('admin'), Admin);
}