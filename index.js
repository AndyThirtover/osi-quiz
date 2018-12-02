var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/qm', function(req, res){
  res.sendFile(__dirname + '/qm.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('answer message', function(msg){
    io.emit('answer message', msg);
  });
  socket.on('quiz message', function(msg){
    io.emit('quiz message', msg);
  });
  socket.on('score message', function(msg){
    io.emit('score message', msg);
  });
  socket.on('results', function(msg){
    io.emit('results', msg);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
