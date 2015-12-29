import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './webpack.config.js';

var bodyParser = require('body-parser');
var Xlsx = require('xlsx-template');
var fs = require('fs');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var onlineUsers = [];

var cors = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
};

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('/', cors, function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('/', cors, function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());

mongoose.connect('mongodb://localhost/users');
var schema = new mongoose.Schema({
  name: String,
  registrationDate: {type: Date, default: Date.now},
  role: {type: Number, min: 0, max: 1, default: 0},
  age: {type: Number, min: 0},
  email: String,
  score: {type: Number, min: 0},
  password: String
});
var User = mongoose.model('User', schema);

// TODO:create authorization logic

app.get('/getUsers', function(req, res) {
  console.log('REQUEST RECEIVED');
  User.find({}, {name: 1, registrationDate: 1, email: 1, score: 1, role: 1 }).lean().exec((err, docs) => {
    if (err) {
      res.status(503).send('greska u konekciji sa bazom');
      console.log('DB ERROR!!!');
    } else {
      var response = [];
      for (let i = 0; i < docs.length; i++) {
        console.log('USER: ' + docs[i].name);
        response.push(docs[i]);
      }
      res.status(200).send(response);
      console.log('USERS SUCCESSFULLY SENT!!!');
    }
  });
});

// user login
app.post('/login', function(req, res) {
  console.log('SUCCESSFULLY RECEIVED USERS INFO' + req.body);
  const user = req.body;
  onlineUsers.forEach((u) => {
    if (u === user.name) {
      res.status(400).send('user je vec loginovan!');
      console.log('ALLREADY LOGIN!!!');
      return;
    }
  });

  var query = User.findOne({name: user.name}, {name: 1, password: 1});
  query.exec((err, userObj) => {
    if (err) {
      res.status(404).send('user nije registrovan');
      console.log(err);
    } else {
      if (userObj !== null && userObj.name === user.name && userObj.password === user.password) {
        res.status(200).send('uspesno logovan!');
        onlineUsers.push(userObj.name);
        console.log(onlineUsers[0] + ' is online now!');
      } else {
        res.status(404).send('user nije loginovan!');
        console.log('404 NOT FOUND!!!');
      }
    }
  });
});

// registering user
app.post('/register', function(req, res) {
  let found = false;
  const user = req.body;
  console.log('successfully received user info' + user);
  User.find({}, {}).lean().exec((err, docs) => {
    if (err) {
      res.status(503).send('greska u bazi!');
      console.log('DB CONNECTION ERROR!!!');
    } else {
      if (docs.length > 0) {
        for (let i = 0; i < docs.length; i++) {
          console.log('USER IN DB: ' + docs[i].name);
        if (docs[i].name === user.name) {
          console.log('USER ALLREADY IN DB!!!');
          found = true;
        }
        }
      	}
      if (!found) {
        var newUser = new User({
          name: user.name,
          age: user.age,
          email: user.email,
          password: user.password
        });
        newUser.save(function(err1, userObj) {
          if (err1) {
            console.log(err1);
            res.status(503).send('ERROR');
          } else {
            res.status(200).send('uspesno registrovan');
            console.log(userObj.name + ' has been added in db!!!');
          }
        });
      } else {
        res.status(401).send('nije registrovan');
        console.log('ALLREADY IN DB');
      }
    }
  });
});

// GENERATING REPORT
app.get('/getReport', function(req, res) {
  fs.readFile(path.join(__dirname, 'templates', 'template1.xlsx'), function(err, data) {
    var template = new Xlsx(data);
    var values = {
      users: []
    };

    User.find({}, {name: 1, email: 1, registrationDate: 1, score: 1, role: 1}).lean().exec((err1, users) => {
      if (err1) {
        res.status(404).send('can not get report!');
        console.log('DB ERROR');
      } else {
        users.forEach	(user => {
          const user1 = {};
          user1.name = user.name;
          user1.email = user.email;
          user1.score = user.score;
          user1.registrationDate = user.registrationDate;
          values.users.push(user1);
        });
      }
    });

    const sheetNumber = 1;

    template.substitute(sheetNumber, values);

    var data1 = template.generate();
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.status(200).send(new Buffer(data1, 'binary'));
    console.log('REPORT SUCCESSFULLY SENT!');
  });
});

// LOGING OUT
app.post('/logout', function(req, res) {
  console.log('LOGOUT REQUEST RECEIVED');
  const user = req.body;
  onlineUsers.forEach((u) => {
    if (u === user.name) {
      if (onlineUsers.indexOf(u) > -1) {
        onlineUsers.splice(onlineUsers.indexOf(u), 1);
        res.status(200).send('user je logoutovan!');
        console.log(user.name + ' vise nije online');
      }
    }
  });
});

// DEELTING ALL USERS, NOT ADMINS
app.delete('/deleteAllUsers', function(req, res) {
  User.remove({role: 0}, (err) => {
    if (err) {
      res.send(500).send('error in db');
      console.log('ERROR in db!!!');
    } else {
      res.status(200).send('svi korisnici su izbrisani');
    }
  });
});

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
