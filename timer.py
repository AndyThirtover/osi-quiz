# Wait for a quiz question and then kick off a timer
# for Ed to add the call to trigger the display

from socketIO_client import SocketIO, LoggingNamespace
import json, collections

scores = {}  # will be populated with scores
q_pos = 0  # used for keeping track of which question to display

def on_connect():
    print('connect')

def on_disconnect():
    print('disconnect')

def on_reconnect():
    print('reconnect')

def do_timer(*args):
    print("QUIZ: " + str(args))
    socketIO.emit('chat message','WAIT FOR IT ...')
    socketIO.wait(seconds=3)
    socketIO.emit('chat message','NOW ANSWER ...')

def update_scores(score):
    if score.keys()[0] in scores:
        scores[score.keys()[0]] += score[score.keys()[0]]
    else:
        scores[score.keys()[0]] = score[score.keys()[0]]
    socketIO.emit('results',(dict(sorted(scores.iteritems(), reverse=True, key=lambda (k,v): (v,k)))))


def do_score(*args):
    print("SCORES:" + str(args[0]))
    update_scores(args[0])

def new_question(*args):
    print("New Question Request")
    next_question = question_file.readline()
    if next_question:
        socketIO.emit('new question',next_question)
    else:
        socketIO.emit('new question','NO MORE QUESTIONS? NOW FOR THE SCORES')



question_file = open('example-questions.txt','r')


socketIO = SocketIO('localhost', 3000, LoggingNamespace)
socketIO.on('connect', on_connect)
socketIO.emit('chat message','Timer.py connected')

socketIO.on('disconnect', on_disconnect)
socketIO.on('reconnect', on_reconnect)

# Listen
print ("Waiting for score message")
socketIO.on('score message', do_score)

print ("Waiting for quiz message")
socketIO.on('quiz message', do_timer)

print ("Waiting for generate message")
socketIO.on('generate', new_question)



while True:
    socketIO.wait(seconds=60)

# Stop listening
socketIO.off('quiz message')
socketIO.emit('chat message',"Timer Stopped")
socketIO.wait(seconds=1)
