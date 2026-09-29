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
G = os.path.join(BASE, '../gh')
RS = f'{G}/use-sound/sounds/remotion-sfx'   # Remotion SFX, CC0
JC = f'{G}/use-sound/stories/sounds'        # use-sound (Josh Comeau), MIT
NT = f'{G}/Notifications/OGG'               # akx/Notifications, CC0
LV = f'{G}/CC0-Public-Domain-Sounds/100-CC0-SFX'  # CC0
MAP = {
    'ding':    [(f'{NT}/Newsflash_Bright.ogg', .9), (f'{NT}/Polite.ogg', .5)],
    'glitch':  [(f'{NT}/Glitch.ogg', .8)],
    'riser':   [(f'{NT}/Chord2_Rev.ogg', .7)],
    'whoosh':  [(f'{RS}/whoosh.wav', .9)],
    'impact':  [(f'{RS}/whip.wav', .6), (f'{LV}/hit_03.ogg', .45)],
    'pop':     [(f'{JC}/pop-up-on.mp3', .7)],
    'sparkle': [(f'{JC}/rising-pops.mp3', .7)],
    'tick':    [(f'{RS}/mouse-click.wav', .35)],
    'alert':   [(f'{NT}/Alarmed.ogg', .7)],
    'count':   [(f'{JC}/switch-on.mp3', .6)],
    'brick':   [(f'{LV}/hit_01.ogg', .45)],
    'thud':    [(f'{LV}/hit_04.ogg', .6), (f'{NT}/Taptap.ogg', .3)],
    'check':   [(f'{JC}/pop-on.mp3', .7)],
    'stamp':   [(f'{RS}/switch.wav', .7), (f'{LV}/hit_02.ogg', .35)],
    'swish':   [(f'{RS}/page-turn.wav', .35)],
    'rise':    [(f'{JC}/rising-pops.mp3', .6)],
    'scan':    [(f'{NT}/Sonar.ogg', .45)],
    'chime':   [(f'{JC}/fanfare.mp3', .55)],
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
music = load(os.path.join(G, 'CC0-1.0-Music/freepd.com', (sys.argv[2] if len(sys.argv) > 2 else 'City Sunshine') + '.mp3'))
M_START = 7.8          # музыка входит вместе с титром
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
duck = (t >= 15.2) & (t < 30.6)          # сцена «проблема» — музыка тише, слышно тиканье
env[duck] = .16
env = np.where((t >= 30.6) & (t < 31.6), .16 + (.42 - .16) * (t - 30.6), env)
env = np.where(t > total - 3.5, env * np.clip((total - t) / 3.5, 0, 1), env)
# сглаживание огибающей
k = int(.15 * SR); ker = np.ones(k) / k
env = np.convolve(env, ker, mode='same').astype(np.float32)
mus *= env[:, None]

mix = mus + sfx
peak = np.abs(mix).max()
mix = mix / peak * 0.89
out = os.path.join(BASE, sys.argv[3] if len(sys.argv) > 3 else 'soundtrack.wav')
subprocess.run([FF, '-y', '-v', 'error', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-c:a', 'pcm_s16le', out],
               input=mix.astype(np.float32).tobytes(), check=True)
print('ok', out, round(total, 2), 's, peak', round(float(peak), 3))
