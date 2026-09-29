"""Сборка звуковой дорожки из готовых CC0-звуков (uisfx, Kenney) и музыки Anttis Instrumentals."""
import json, subprocess, numpy as np, imageio_ffmpeg, os, sys

FF = imageio_ffmpeg.get_ffmpeg_exe()
SR = 44100
BASE = os.path.dirname(os.path.abspath(__file__))
U = os.path.join(BASE, '../snd/u/package/sounds')
K = os.path.join(BASE, '../snd/arc/arcade/resources/assets')

def load(path):
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()

# тип подсказки → (файл, громкость)
MAP = {
    'ding':    [(f'{U}/glass/notification.mp3', .9)],
    'glitch':  [(f'{U}/cinematic/error.mp3', .8)],
    'riser':   [(f'{U}/cinematic/scanning.mp3', .6)],
    'whoosh':  [(f'{U}/cinematic/swipe.mp3', .85)],
    'impact':  [(f'{U}/cinematic/drop.mp3', .9), (f'{K}/sounds/rockHit2.wav', .35)],
    'pop':     [(f'{U}/soft/open.mp3', .55)],
    'sparkle': [(f'{U}/cinematic/achievement.mp3', .55)],
    'tick':    [(f'{U}/studio/typing.mp3', .5)],
    'alert':   [(f'{U}/cinematic/warning.mp3', .6)],
    'count':   [(f'{U}/glass/progress-step.mp3', .6)],
    'brick':   [(f'{K}/sounds/hit2.wav', .45)],
    'thud':    [(f'{U}/cinematic/blocked.mp3', .85)],
    'check':   [(f'{U}/glass/check.mp3', .6)],
    'stamp':   [(f'{U}/cinematic/lock.mp3', .75)],
    'swish':   [(f'{U}/studio/swipe.mp3', .4)],
    'rise':    [(f'{U}/glass/level-up.mp3', .55)],
    'scan':    [(f'{U}/cinematic/scanning.mp3', .6)],
    'chime':   [(f'{U}/cinematic/success.mp3', .8)],
}
cache = {}
def snd(p):
    if p not in cache: cache[p] = load(p)
    return cache[p]

d = json.load(open(os.path.join(BASE, 'cues.json')))
total = d['total'] + 0.5
N = int(total * SR)
sfx = np.zeros((N, 2), np.float32)

def put(buf, t, a, g):
    i = int(t * SR)
    if i >= N: return
    n = min(len(a), N - i)
    buf[i:i + n] += a[:n] * g

for c in d['cues']:
    if c['s'] == 'tick':  # тиканье каждую секунду c['v'] раз
        for k in range(int(c['v'] * 1)):
            for p, g in MAP['tick']: put(sfx, c['t'] + k, snd(p), g)
        continue
    for p, g in MAP[c['s']]:
        put(sfx, c['t'], snd(p), g)

# ---- музыка ----
music = load(f'{K}/music/funkyrobot.mp3')
M_START = 6.8          # музыка входит вместе с титром
OFFSET = float(sys.argv[1]) if len(sys.argv) > 1 else 0.0
seg = music[int(OFFSET * SR):]
mus = np.zeros((N, 2), np.float32)
n = min(len(seg), N - int(M_START * SR))
mus[int(M_START * SR):int(M_START * SR) + n] = seg[:n]
# огибающая громкости музыки
t = np.arange(N) / SR
env = np.full(N, .42, np.float32)
env[t < M_START] = 0
env = np.where((t >= M_START) & (t < M_START + 1.2), .42 * (t - M_START) / 1.2, env)
duck = (t >= 13.5) & (t < 26.2)          # сцена «проблема» — музыка тише, слышно тиканье
env[duck] = .16
env = np.where((t >= 26.2) & (t < 27.2), .16 + (.42 - .16) * (t - 26.2), env)
env = np.where(t > total - 3.5, env * np.clip((total - t) / 3.5, 0, 1), env)
# сглаживание огибающей
k = int(.15 * SR); ker = np.ones(k) / k
env = np.convolve(env, ker, mode='same').astype(np.float32)
mus *= env[:, None]

mix = mus + sfx
peak = np.abs(mix).max()
mix = mix / peak * 0.89
out = os.path.join(BASE, 'soundtrack.wav')
subprocess.run([FF, '-y', '-v', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-c:a', 'pcm_s16le', out],
               input=mix.astype(np.float32).tobytes(), check=True)
print('ok', out, round(total, 2), 's, peak', round(float(peak), 3))
