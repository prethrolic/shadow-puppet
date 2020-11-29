import torch
import torch.nn as nn
import torch.nn.functional as F
import librosa
import numpy as np
import socket
import os
import sys
import subprocess
import pickle
import warnings
warnings.filterwarnings('ignore')

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

def get_audio_cnn(path1, path2):
	ref_data = spec_to_image(get_melspectrogram_db(path1))[np.newaxis,...]
	test_data = spec_to_image(get_melspectrogram_db(path2))[np.newaxis,...]

	LEN = 7501
	if ref_data.shape[2] < LEN:
		p = np.zeros(shape=(ref_data.shape[0],ref_data.shape[1],LEN-ref_data.shape[2]))
		ref_data = np.concatenate((ref_data, p), axis=2)
	if test_data.shape[2] < LEN:
		p = np.zeros(shape=(test_data.shape[0],test_data.shape[1],LEN-test_data.shape[2]))
		test_data = np.concatenate((test_data, p), axis=2)

	return ref_data, test_data

def get_melspectrogram_db(file_path, sr=None, n_fft=2048, hop_length=32, n_mels=128, fmin=20, fmax=8300, top_db=80):
	wav,sr = librosa.load(file_path,sr=sr)
	if wav.shape[0]<5*sr:
		wav=np.pad(wav,int(np.ceil((5*sr-wav.shape[0])/2)),mode='reflect')
	else:
		wav=wav[:5*sr]
	spec=librosa.feature.melspectrogram(wav, sr=sr, n_fft=n_fft,
		hop_length=hop_length,n_mels=n_mels,fmin=fmin,fmax=fmax)
	spec_db=librosa.power_to_db(spec,top_db=top_db)
	return spec_db

def spec_to_image(spec, eps=1e-6):
	mean = spec.mean()
	std = spec.std()
	spec_norm = (spec - mean) / (std + eps)
	spec_min, spec_max = spec_norm.min(), spec_norm.max()
	spec_scaled = 255 * (spec_norm - spec_min) / (spec_max - spec_min)
	spec_scaled = spec_scaled.astype(np.uint8)
	return spec_scaled

class ConvNet(nn.Module):
	def __init__(self):
		super(ConvNet, self).__init__()
		self.conv = nn.Sequential(
			nn.Conv2d(1, 16, kernel_size=17, stride=4, padding=8),
			nn.BatchNorm2d(16),
			nn.ReLU(),
			nn.MaxPool2d(kernel_size=4, stride=2),
			nn.Conv2d(16, 32, kernel_size=17, stride=4, padding=8),
			nn.BatchNorm2d(32),
			nn.ReLU(),
			nn.MaxPool2d(kernel_size=4, stride=2))
		self.fc1 = nn.Linear(7424, 256)
		self.fc2 = nn.Linear(256, 64)
		self.fc3 = nn.Linear(64, 1)
		
	def forward(self, x1, x2):
		out1 = self.conv(x1)
		out1 = out1.reshape(out1.size(0), -1)
		out2 = self.conv(x2)
		out2 = out2.reshape(out2.size(0), -1)
		out = torch.cat((out1, out2), 1)
		out = F.relu(self.fc1(out))
		out = F.relu(self.fc2(out))
		out = self.fc3(out)
		return out


model = ConvNet().to(device)

save_model = 'model/train_FINE_16.ckpt'
state = torch.load(save_model)
model.load_state_dict(state['state_dict'])

model.eval()

s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
try:
	os.remove("/tmp/shadow_socket")
except OSError:
	pass

s.bind("/tmp/shadow_socket")
s.listen(1)

print("Model is ready")
with torch.no_grad():
	while True:
		print("Waiting for connection...")
		conn, addr = s.accept()

		files = conn.recv(1024)
		f1, f2 = files.decode('UTF-8').split()
		print("Processing {}...".format(f1.split('/')[-1].split('.')[0]))
		
		conn.send(b' ')

		words = conn.recv(1024)
		words = pickle.loads(words)


		mv_csv = f1[:-4]+'.csv'
		f = open(mv_csv, 'r')
		mv_w = f.readlines()
		mv_w = [float(pair.strip().split(',')[-1]) for pair in mv_w]

		if len(words) != len(mv_w)-1:
			ext = '_'.join(str(x) for x in words)
			mv_dir = f1[:-4].split("/")[0]
			mv_name = f1[:-4].split("/")[-1]
			new_f1 = "{}/cuts/{}_{}.wav".format(mv_dir,mv_name,ext)
			if not os.path.exists(new_f1):
				mute_list = ""
				for i, t in enumerate(mv_w[:-1]):
					if not i in words:
						if len(mute_list) > 0:
							mute_list += ", "
						mute_list += "volume=enable='between(t,{},{})':volume=0".format(t,mv_w[i+1])

				subprocess.call(['ffmpeg', '-i', f1, '-af', mute_list, '-c:v', 'copy', new_f1, '-y', '-hide_banner'])
		print(new_f1)

		x1, x2 = get_audio_cnn(new_f1, f2)
		x1, x2 = torch.from_numpy(x1).unsqueeze(0).to(device).float(), torch.from_numpy(x2).unsqueeze(0).to(device).float()

		y_hat = model(x1, x2)

		score = str(int(y_hat.data.item()*100))
		conn.send(score.encode('UTF-8'))

conn.close()
