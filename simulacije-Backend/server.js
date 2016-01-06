"use strict"
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './webpack.config.js';
var path = require('path');
var bodyParser = require('body-parser');
var XlsxTemplate = require('xlsx-template');
var fs = require('fs');
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var onlineUsers = [];
var async = require('async');

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
  score: {type: Number},
  password: String
});
var User = mongoose.model('User', schema);

// geting all users info TESTED
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

// user login TESTED

app.post('/login', cors, function(req, res) {
   console.log('SUCCESSFULLY RECEIVED USERS INFO ' + req.body.name);
  const user = req.body;
  onlineUsers.forEach((u) => {
    if (u === user.name) {
      res.sendStatus(400);
      console.log('ALLREADY LOGIN!!!');
      return;
    }
  });

  var query = User.findOne({name: user.name}, { name: 1, password: 1, role: 1 });
  query.exec((err, userObj) => {
    if (err) {
      res.status(404).send('user nije registrovan');
      console.log(err);
    } else {
      if (userObj !== null && userObj.name === user.name && userObj.password === user.password) {
        res.status(userObj.role).send(); 
        onlineUsers.push(userObj.name);
        console.log(onlineUsers[onlineUsers.length-1] + ' is online now!');
      } else {
        res.status(404).send('user nije loginovan!');
        console.log('404 NOT FOUND!!!');
      }
    }
  });
});

// registering user TESTED
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
          password: user.password,
          role: user.role,
          score: 0
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

// GENERATING REPORT TESTED
app.get('/getReport', function(req, res) {
  var values = {
    user:[]
  };

  async.series([
    function(callback) {
    User.find({}, {name: 1, email: 1, age:1, registrationDate: 1, score: 1, role: 1}).lean().exec((err1, users) => {
      if (err1) {
        res.status(404).send('can not get report!');
        console.log('DB ERROR');
      } else {
        users.forEach (user => {
          var user1 = {};
          user1.name = user.name;
          user1.email = user.email;
          user1.score = user.score;
          user1.age = user.age;
          user1.role = user.role==1 ? 'admin' : 'user';
          user1.registrationDate = Date(user.registrationDate);
          values.user.push(user1);
        });
      }
    });
    console.log('all users loaded');
  console.log('first function excecuted');
    callback(null, 'function getAllusers excecuted');
    },
      function(callback){
                console.log('loading file started');
   fs.readFile(path.join(__dirname, 'templates', 'template1.xlsx'), function(err, data) {
                console.log('loading file finished');

    if (err) {
      res.sendStatus(500);
    }
    console.log('users for report are ' + values);
    var template = new XlsxTemplate(data);
    var sheetNumber = 1;
    template.substitute(sheetNumber, values);
   var data1 = template.generate();

    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    console.log(new Buffer(data1, 'binary'));
    res.send(new Buffer(data1, 'binary'));
    console.log('REPORT SUCCESSFULLY SENT!' + values.user);
  });
           callback(null, 'function generateReport excecuted');
      }
    ]);
  });


// LOGING OUT
app.post('/logout', cors, function(req, res) {
  var found = false;
  console.log('LOGOUT REQUEST RECEIVED '+ req.body);
  const user = req.body;
  onlineUsers.forEach((u) => {
    if (u === user.name) {
      if (onlineUsers.indexOf(u) > -1) {
        found = true;
        onlineUsers.splice(onlineUsers.indexOf(u), 1);
        console.log(user.name + ' vise nije online');
        return;
      }
    }
  });

  if (!found) {
  res.sendStatus(404);
  } else {
  res.status(200).send('user je logoutovan!');

  }
});

// DELETING ALL USERS TESTED
app.delete('/deleteAllUsers', function(req, res) {
	console.log('delete request received');
  User.find({}).remove(function(err){
  	if(!err) {
  		console.log('deleted');
  		res.status(200).send('obrisani');
  	} else {
  		res.status(503).send('greska');
  	}
  });
});

// USER SCORE UPDATE TESTED
app.post('/updateScore', cors, function(req, res) {
  var userInfo = req.body;
      	  var score = parseInt(userInfo.score);
  onlineUsers.forEach((u) => {
    if (u === userInfo.name) {
      User.findOne({name: userInfo.name}).lean().exec((err, user) => {
        if (!err) {
   			score += user.score;
   			console.log('nasao korisnika ' + user.name);
   			console.log('stari score  ' + user.score);
    		} else {
    		  res.status(404).send('nema ga u bazi');
    		}
    	});
      console.log('novi skor ' + score);
      User.update({ name: userInfo.name }, { $inc: { score: score }}, { multi: true }, (error, numAffected) => {
      	console.log('broj izmenjenih korisnika ' + numAffected.n);
      	if (!error && numAffected.n > 0){
      		res.status(200).send(String(score));
          console.log('poslat broj ' + score);
      	} else {
      		res.status(500).send('nije azuriran');
      	}
      	console.log(' new score ' + parseInt(score));
      });
  	}
  });
});

app.get('/getCurrentUser', cors, function(req, res) {
  console.log('game want user!!!');
  if(onlineUsers.length > 0)
res.status(200).send(onlineUsers[onlineUsers.length-1]);
else
res.status(404).send('niko nije logovan');
});

app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
