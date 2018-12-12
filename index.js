var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var fs = require("fs");

app.use(express.static("public"));

var questions = fs.readFileSync("example-questions.txt", "utf8").split(/\r?\n/);
var remainingQuestions = questions.slice(0);
var scoreStore = {};

io.on("connection", function(socket) {
  socket.on("reset all", function() {
    scoreStore = {};
    remainingQuestions = questions.slice(0);
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
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      var score = scoreStore[user];
      if (scores.indexOf(score) < 0) {
        scores.push(score);
      }
      usersByScore[score] = usersByScore[score] || [];
      usersByScore[score].push(user);
    }
    var sortedScores = scores.sort(function(a, b) {
      var intA = parseInt(a);
      var intB = parseInt(b);
      if (intA < intB) {
        return -1;
      } else if (intA > intB) {
        return 1;
      } else {
        return 0;
      }
    }).reverse();
    var sortedScoreStore = [];
    for (i = 0; i < sortedScores.length; i++) {
      var score = sortedScores[i];
      sortedScoreStore.push({
        score: score,
        users: usersByScore[score]
      });
    }

    io.emit("results", sortedScoreStore);
  });
  socket.on("generate", function() {
    if (remainingQuestions.length) {
      var questionIndex = Math.floor(Math.random() * remainingQuestions.length);
      var question = remainingQuestions.splice(questionIndex, 1)[0];
    }

    if (question) {
      io.emit("new question", question);
    } else {
      io.emit("new question", "NO MORE QUESTIONS? NOW FOR THE SCORES");
    }
  });
});

var port = process.env.PORT || 3000;
http.listen(port, function() {
  console.log("listening on *:" + port);
});
