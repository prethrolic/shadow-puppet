import socket
import os
import sys
import pickle
import warnings
warnings.filterwarnings('ignore')

s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.connect("/tmp/shadow_socket")

f1 = 'movie/'+sys.argv[2]
f2 = sys.argv[1]
w = sys.argv[3].split("-")
w = pickle.dumps(w)

send_msg = '{} {}'.format(f1, f2).encode('UTF-8')
s.send(send_msg)
s.recv(1024)
s.send(w)

score = s.recv(1024).decode('UTF-8')
s.send(b' ')

exp = s.recv(1024)
exp = pickle.loads(exp)

s.close()

userwords = [i+':'+str(j) for (i,j) in exp[1]]
results = [score, '_'.join([str(x) for x in exp[0]]), '_'.join(userwords)]
results = '/'.join(results)

print(results)
sys.stdout.flush()
