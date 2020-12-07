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
import speech_recognition as sr
import ffmpeg
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

def get_length(audio):
	result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', audio], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
	return float(result.stdout)

def speech_to_text(audio_file: str)->str:
	ogg = ffmpeg.input(audio_file)
	newname = audio_file[:-4]+"_wav.wav"
	fout = ffmpeg.output (ogg, newname)
	fout.global_args("-hide_banner")
	fout.global_args("-loglevel", "warning")

	fout.run()
	r = sr.Recognizer()
	with sr.AudioFile(newname) as src:
		audio = r.record(src)
	
	def fallback(audio):
		try:
			fallback_pred = r.recognize_sphinx(audio, language="en-GB", show_all=True)
			timestamp = [(seg.word, seg.start_frame, seg.end_frame) for seg in fallback_pred.seg()]
		except sr.UnknownValueError:
			fallback_pred = ""
			timestamp = []
		except sr.RequestError as e:
			fallback_pred = ""
			timestamp = []
		return fallback_pred, timestamp
		
	# recognize speech using Google Speech Recognition
	try:
		# for testing purposes, we're just using the default API key
		# to use another API key, use `r.recognize_google(audio, key="GOOGLE_SPEECH_RECOGNITION_API_KEY")`
		# instead of `r.recognize_google(audio)`
		google_pred = r.recognize_google(audio, language="en-UK")
		fallback_pred = r.recognize_sphinx(audio, language="en-US", show_all=True)
		timestamp = [(seg.word, seg.start_frame, seg.end_frame) for seg in fallback_pred.seg()]
		return google_pred, timestamp
	except sr.UnknownValueError:
		print("ERROR!")
		return fallback(audio), []
	except sr.RequestError as e:
		print("ERROR2")
		return fallback(audio), []

def getIoU(w1, w2):
	w1 = [w.lower() for w in w1]
	w2 = [w.lower() for w in w2]
	union = len(set(w1+w2))
	inter = len([w for w in w2 if w in w1])
	return max(float(inter)/len(w1), 1.0)


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
		mv_words = [pair.strip().split(',')[0] for pair in mv_w][:-1]
		mv_time = [float(pair.strip().split(',')[-1]) for pair in mv_w]

		if len(words) != len(mv_time)-1:
			ext = '_'.join(str(x) for x in words)
			mv_dir = f1[:-4].split("/")[0]
			mv_name = f1[:-4].split("/")[-1]
			new_f1 = "{}/cuts/{}_{}.wav".format(mv_dir,mv_name,ext)
			if not os.path.exists(new_f1):
				mute_list = ""
				for i, t in enumerate(mv_time[:-1]):
					if not str(i) in words:
						if len(mute_list) > 0:
							mute_list += ", "
						if i == 0:
							t = 0
						mute_list += "volume=enable='between(t,{},{})':volume=0".format(t,mv_time[i+1])

				subprocess.call(['ffmpeg', '-i', f1, '-af', mute_list, '-c:v', 'copy', new_f1, '-y', '-hide_banner'])
			print(new_f1)
			f1 = new_f1

		exp = [[],[]]
		# user_words = ["hi", "everyone", "nice", "congratulations", "what", "did", "to", "glasses"]
		# user_sent = "Come to the nation Harry I come believe you solved eat".lower()
		user_sent, timestamp = speech_to_text(f2)
		user_words = user_sent.split()
		f2 = f2[:-4]+"_wav.wav"
		fin = timestamp[-1][-1]
		aud_len = get_length(f2)
		words_list = [pair.strip().split(',')[0].lower() for idx, pair in enumerate(mv_w) if str(idx) in words]
		if len(words) != len(mv_time)-1:
			ext = '_'.join(str(x) for x in words)
			upload_dir = f2[:-4].split("/")[0]
			file_name = f2[:-4].split("/")[-1]
			new_f2 = "{}/{}_{}.wav".format(upload_dir,file_name,ext)
			print(new_f2)
			if not os.path.exists(new_f2):
				mute_list = ""
				for i, w in enumerate(timestamp):
					if not w[0] in words_list and not "<" in w[0]:
						if len(mute_list) > 0:
							mute_list += ", "
						ts, te = w[1]/fin*aud_len, w[2]/fin*aud_len
						mute_list += "volume=enable='between(t,{},{})':volume=0".format(ts, te)

				subprocess.call(['ffmpeg', '-i', f2, '-af', mute_list, '-c:v', 'copy', new_f2, '-y', '-hide_banner'])
			f2 = new_f2

		print(timestamp)
		print(user_words)
		print(words_list)

		x1, x2 = get_audio_cnn(f1, f2)
		x1, x2 = torch.from_numpy(x1).unsqueeze(0).to(device).float(), torch.from_numpy(x2).unsqueeze(0).to(device).float()

		y_hat = model(x1, x2)
		sc1 = int(y_hat.data.item()*100*0.4)
		sc2 = int(getIoU(words_list, user_words)*100*0.6)
		print(sc1, sc2)
		score = max(min(sc1+sc2,100),0)
		score = str(score).zfill(2)
		conn.send(score.encode('UTF-8'))

		conn.recv(1024)

		# user_idx = 0
		for i, w in enumerate(mv_words):
			if not str(i) in words:
				exp[0].append(-1)
			elif w in user_words:
				exp[0].append(1)
			else:
				exp[0].append(0)

		for i, w in enumerate(user_words):
			if w in mv_words:
				pos = mv_words.index(w)
				if not str(pos) in words:
					exp[1].append([w,-1])
				else:
					exp[1].append([w,1])
			else:
				exp[1].append([w,0])

		exp = pickle.dumps(exp)
		conn.send(exp)

conn.close()
