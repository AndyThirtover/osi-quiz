# Wait for a quiz question and then kick off a timer
# Score System

from socketIO_client import SocketIO, LoggingNamespace

scores = {}

def on_connect():
    print('connect')

def on_disconnect():
    print('disconnect')

def on_reconnect():
    print('reconnect')

def do_score(*args):
    print(args)
    socketIO.emit('chat message','Scores Processed')


socketIO = SocketIO('localhost', 3000, LoggingNamespace)
socketIO.on('connect', on_connect)
socketIO.emit('chat message','scores.py connected')
socketIO.on('disconnect', on_disconnect)
socketIO.on('reconnect', on_reconnect)

# Listen
print ("Waiting for score update")
socketIO.on('score', do_score)

while True:
    socketIO.wait(seconds=60)

# Stop listening
socketIO.off('score')
socketIO.emit('chat message',"Timer Stopped")
socketIO.wait(seconds=1)
