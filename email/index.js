const path = require('path')
const nodemailer = require("nodemailer");
const hbs = require('nodemailer-express-handlebars');

const transporter = nodemailer.createTransport({
  host: "smtp.mail.ru",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASS,
  },
  // tls: {
  //   maxVersion: 'TLSv1.3',
  //   minVersion: 'TLSv1.2',
  //   ciphers: 'TLS_AES_128_GCM_SHA256',
  //   rejectUnauthorized: false
  // },
})

transporter.use('compile', hbs({
  viewEngine: {
    extname: '.hbs',
    layoutsDir: './email/templates/',
    defaultLayout: false,
    partialsDir: './email/templates/',
  },
  viewPath: './email/templates/',
  extName: '.hbs',
  helpers: {
    upper: function(val) {
      return val.toUpperCase();
    }
  }
}));

const emailOnCreate = ({email, password}) => {
  try {
    const mail = {
      from: `"Kakotel.ru" <${process.env.EMAIL_LOGIN}>`,
      to: email,
      subject: 'Регистрация и бронирования',
      template: 'new',
      context: {
        email, 
        password
      }
    }
    transporter.sendMail(mail);
  } catch (e) {
    console.log(e);
  }
}

const emailOnContact = (data) => {
  try {
    const mail = {
      from: `"Kakotel.ru" <${process.env.EMAIL_LOGIN}>`,
      to: 'admin@kakotel.ru',
      subject: 'Новое сообщение с формы',
      template: 'contact',
      context: data
    }
    transporter.sendMail(mail);
  } catch (e) {
    console.log(e);
  }
}

const emailOnRestore = ({email, password}) => {
  try {
    const mail = {
      from: `"Kakotel.ru" <${process.env.EMAIL_LOGIN}>`,
      to: email,
      subject: 'Сгенерирован новый пароль',
      template: 'restore',
      context: {
        email,
        password
      }
    }
    transporter.sendMail(mail);
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  emailOnCreate,
  emailOnContact,
  emailOnRestore
}