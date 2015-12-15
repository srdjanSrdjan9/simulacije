/* eslint no-console: 0 */
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
var MongoClient = mongodb.MongoClient;
var mongoose = require('mongoose');

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
  app.get('*', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
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
  role: {type: Number, min: 0, max: 1},
  age: {type: Number, min: 0},
  email: String,
  score: {type: Number, min: 0},
  password: String
});
var User = mongoose.model('User', schema);

app.get('/users', cors, function(req, res) {
  var query = User.find({}, {name: 1, email: 1, registrationDate: 1, age: 1, role: 1, score: 1, _id: 0});
  query.exec((err, docs) => {
    if (err) {
      res.status(503).send('greska u konekciji sa bazom');
      console.log('GRESKA U BAZI!!!');
    } else {
      res.status(200).send(docs);
      console.log('USERS SUCCESSFULLY SENT!!!');
    }
  });
});

// user login
app.post('/login', cors, function(req, res) {
  const user = req.body;
  console.log('successfully received user info' + user);
  var query = User.findOne({name: user.name}, {name: 1, password: 1});
  query.exec((err, userObj) => {
    if (err) {
      res.status(404).send('user nije registrovan');
      console.log(err);
    } else {
      if (userObj.name === user.name && userObj.password === user.password) {
        res.status(200).send('uspesno logovan!');
        console.log('200 OK!!!');
      } else {
        res.status(404).send('user nije registrovan!');
        console.log('404 NOT FOUND!!!');
      }
    }
  });
});

// registering user
app.post('/register', cors, function(req, res) {
  let found = false;
  const user = req.body;
  console.log('successfully received user info' + user);
  var query = User.find({}, {});
  query.exec((err, docs) => {
    if (err) {
      res.status(503).send('greska u bazi!');
      console.log('DB CONNECTION ERROR!!!');
    } else {
      console.log('USERS IN DB ARE: ' + docs);
      docs.foreach(dbUser => {
        if (dbUser.name === user.name) {
          console.log('USER ALLREADY IN DB!!!');
          found = true;
          return;
        }
      });
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
            res.status(503).send('nije registrovan');
          } else {
            res.status(200).send('uspesno registrovan');
            console.log(userObj + ' has been added in db!!!');
          }
        }); 
      }
    }
  });
});

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
