var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var fs = require("fs");

app.use(express.static("public"));

var questions = fs.readFileSync("example-questions.txt", "utf8").split(/\r?\n/);
var scores = {};
var question_index = 0;

io.on("connection", function(socket) {
  socket.on("reset all", function() {
    scores = {};
    question_index = 0;
    io.emit("results", scores);
  });
  socket.on("answer message", function(userName) {
    socket.broadcast.emit("answer message", userName);
  });
  socket.on("quiz message", function(question) {
    io.emit("quiz message", question);
  });
  socket.on("score message", function(score) {
    // score = {'userName':1} or {'userName':-1}
    socket.broadcast.emit("score message", score);
    var userName = Object.keys(score)[0];
    scores[userName] = scores[userName] || 0;
    scores[userName] += score[userName];
    io.emit("results", scores);
  });
  socket.on("results", function(msg) {
    io.emit("results", msg);
  });
  socket.on("generate", function() {
    if (question_index < questions.length) {
      io.emit("new question", questions[question_index]);
      question_index += 1;
    } else {
      io.emit("new question", "NO MORE QUESTIONS? NOW FOR THE SCORES");
    }
  });
});

var port = process.env.PORT || 3000;
http.listen(port, function() {
  console.log("listening on *:" + port);
});
