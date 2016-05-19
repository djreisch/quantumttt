const path = require('path');
const express = require('express');
const Game = require('./src/Game.js');

const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const port = process.env.PORT || 5001;

//set our express server to use the build folder
app.use(express.static(path.join(__dirname, 'build')))

let games = {}

//this serves the homepage
app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname + '/build'});
})

//this serves the offline game page
app.get('/offline', (req, res) => {
  res.sendFile('index.html', {root: __dirname + '/build'});
})

//this preps the global online game page
app.post('/g/:room', (req, res) => {
  connect(req, res);
})

//this serves the global online game page index to the player room
app.get('/g/:room', (req, res) => {
  res.sendFile('index.html', {root: __dirname + '/build'});
});

connect = (req, res) => {
  console.log(req.params);
  let room = req.params.room;
  let nsp = io.of(`/g/${room}`);

  if (games[room] === undefined)
    games[room] = new Game()

  nsp.once('connection', (socket) => {
    console.log(`${socket.id} connected!`);
    let game = games[room]

    if (game.X === undefined)
      game.X = socket.id;
    else if (game.Y === undefined){
      game.Y = socket.id;
      game.room = room;
      nsp.to(game.X).emit('new status', 'You are player X! Click on any square to begin.');
      nsp.to(game.Y).emit('new status', 'You are player Y! Wait for player X make their move.');
    }
    else
      return;

    console.log(`Player X: ${games[room].X}`);
    console.log(`Player Y: ${games[room].Y}`);

    //interpret user clocks and save game.state of players X and Y
    socket.on('click', (squareNum) => {
      let game = games[room];

      if (game.isTurn(socket.id)){
        let status = game.handleSquareClick(squareNum);
        nsp.emit('new state', game.state);

        if (status.X)
          nsp.to(game.X).emit('new status', status.X);
        if (status.Y)
          nsp.to(game.Y).emit('new status', status.Y);

      } else {
        nsp.to(socket.id).emit('new status', "Not your turn!");
      }
    });

    //when a player creates a cyclical loop we need to collapse
    socket.on('collapse click', (choice) => {
      let game = games[room];

      if (game.isTurn(socket.id) &&
          game.state.cycleMarks.includes(choice)){

        game.handleCollapse(choice);
        nsp.emit('new state', game.state);
      } else {
        nsp.to(socket.id).emit('new status', "Not your turn!");
      }
    });

    socket.on('request status', () => {
      let game = games[room];
      let status = `Welcome! You are player ${game.getPlayer(socket.id)}`;
      nsp.to(socket.id).emit('new status', status);
    });
  });
}


http.listen(port, () => {
  console.log(`listening on *:${port}`);
});
