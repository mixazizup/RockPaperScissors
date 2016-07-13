var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var bodyParser = require('body-parser');
var browserify = require('browserify-middleware');
var history = require('connect-history-api-fallback');
var db = require('./db');

module.exports = app;

app.use(history())
app.use(bodyParser.json());

// using accessCode from request body, create new game record in db
app.post('/api/games', (req, res) => {
  db('games').insert({
    access_code: req.body.accessCode, 
    status: 'setup'
  })
    .then(gameId => {
      return db('users').insert({
        game_id: gameId, 
        username: req.body.username,
        status: 'waiting',
        score: 0
      })
        .then(userId => {
          res.send({
            gameId: gameId[0],
            userId: userId[0]
          })
        })
    })
});

// select accessCodes of existing games, returns array
app.get('/api/games', (req, res) => {
  db.select('access_code').from('games')
    .then(rows => {
      res.send(rows.map(game => game.access_code));
    });
});

// use history api fallback middleware after defining db routes
// to not interfere get requests
app.use(history());
app.use(express.static(path.join(__dirname, "../client/public")));

app.get('/app-bundle.js',
 browserify('./client/main.js', {
    transform: [ [ require('babelify'), { presets: ["es2015", "react"] } ] ]
  })
);

//  socket.io is listening for queues triggered by
//    players, then emits information to both
//  TO DO: synch it up with all player actions so
//    displays match across players in real time

io.on('connection', function(socket){
	socket.on('player ready', function(playerDetails){
		io.emit('game ready', playerDetails)
	})
})

var port = process.env.PORT || 4000;
http.listen(port);
console.log("Listening on localhost: " + port);

app.post('/api/games', (req,res) => {
  collectRequestBody(req, (accessCode) => {
    db('games').insert({access_code: accessCode, status: 'waiting'})
      .then(gameId => {
        res.send(gameId);
      });
  })
});

var port = process.env.PORT || 4000;
app.listen(port);
console.log("Listening on localhost:" + port);
