import socket
import os
import sys
import pickle
import warnings
warnings.filterwarnings('ignore')

s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.connect("/tmp/shadow_socket")

f1 = 'movie/'+sys.argv[3]
f2 = sys.argv[2]
w = sys.argv[4].split("-")
w = pickle.dumps(w)

send_msg = '{} {}'.format(f1, f2).encode('UTF-8')
s.send(send_msg)
s.recv(1024)
s.send(w)
score = s.recv(1024).decode('UTF-8')
s.close()
	
print(score)
sys.stdout.flush()
