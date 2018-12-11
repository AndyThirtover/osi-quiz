var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var fs = require("fs");

app.use(express.static("public"));

var questions = fs.readFileSync("example-questions.txt", "utf8").split(/\r?\n/);
var scoreStore = {};
var question_index = 0;

io.on("connection", function(socket) {
  socket.on("reset all", function() {
    scoreStore = {};
    question_index = 0;
    io.emit("results", scoreStore);
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
    scoreStore[userName] = scoreStore[userName] || 0;
    scoreStore[userName] += score[userName];

    var usersByScore = {};
    var scores = [];
    var users = Object.keys(scoreStore);
    for (var i=0; i<users.length; i++) {
      var user = users[i];
      var score = scoreStore[user];
      if (scores.indexOf(score) < 0) {
        scores.push(score);
      }
      usersByScore[score] = usersByScore[score] || [];
      usersByScore[score].push(user);
    }
    var sortedScores = scores.sort().reverse();
    var sortedScoreStore = [];
    for (i=0; i<sortedScores.length; i++) {
      var score = sortedScores[i];
      sortedScoreStore.push({
        score: score,
        users: usersByScore[score]
      });
    }

    io.emit("results", sortedScoreStore);
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
