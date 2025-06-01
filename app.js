require('dotenv').config()
const http = require('http');
const { Server } = require("socket.io");
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path');
const bcrypt = require('bcrypt')
const Routes = require('./routes')
const { Socket } = require('./socket')

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGOOSE_ACC, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

require('./cron')
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

global.io = io;

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api/file', express.static(path.join(__dirname, '/public/uploads')));

Routes(app)
Socket(global.io);


// const fs = require('fs')
// const CyrillicToTranslit = require('cyrillic-to-translit-js');
// const cyrillicToTranslit = new CyrillicToTranslit();

// fs.readFile(path.join(__dirname, 'cities.txt'), {encoding: 'utf-8'}, function(err,data){
//   if (!err) {
//     const cities = data.split('\n').map(el => el.replace('\r', ''));
//     const cities_normolize = []
//     for (let index = 0; index < cities.length; index++) {
//       const element = cities[index];
//       if(element.trim().length > 0) {
//         const data = {
//           name: element,
//           value: ''
//         }

//         const translit = cyrillicToTranslit.transform(element, '_').toLowerCase().replace('-', '_');
//         data.value = translit;
//         cities_normolize.push(data)
//       }
//     }

//     fs.writeFile(path.join(__dirname, 'cities_new.json'), JSON.stringify(cities_normolize), err => {
//       if (err) {
//         console.error(err);
//       } else {
//         console.log('file written successfully');
//       }
//     });
    
//   } else {
//     console.log(err);
//   }
// });


// fs.readFile(path.join(__dirname, 'global', 'cities.json'), {encoding: 'utf-8'}, function(err,data){
//   if (!err) {
//     const cities = JSON.parse(data).sort(function(a, b){
//       if(a.value < b.value) { return -1; }
//       if(a.value > b.value) { return 1; }
//       return 0;
//     });
//     console.log(cities.length);
    
//     const unique = cities.filter((value, index, self) =>
//       index === self.findIndex((t) => (
//         t.name === value.name
//       ))
//     )
    

//     fs.writeFile(path.join(__dirname, 'cities_new.json'), JSON.stringify(unique), err => {
//       if (err) {
//         console.error(err);
//       } else {
//         console.log('file written successfully');
//       }
//     });
    
//   } else {
//     console.log(err);
//   }
// });


// console.log(bcrypt.hashSync('xV2pS6nA8bD4', 10));

const port = process.env.PORT || 4000;
server.listen(port, (err) => {
  if (err) console.log(err);
  console.log(`Sever running on port http://localhost:${port}`)
})