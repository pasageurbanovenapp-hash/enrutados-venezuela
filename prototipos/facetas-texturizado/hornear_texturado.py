"""Hornea el bus texturizado a los dos presets de facetas.

Decima por agrupacion de vertices, y para cada faceta lee su UV en el atlas
de color del modelo original para clasificar la region. El atlas NO se usa
como color final: tiene luz horneada. Se usa para saber que es cada faceta.

Salidas (mismo formato que la buseta):
  facetas.bin      niveles indexados con grupo  (canvas)
  facetas-web.bin  no indexado con atributos     (WebGL)
"""
import json, struct, sys, os, subprocess
import numpy as np

SRC = sys.argv[1] if len(sys.argv) > 1 else "/home/joserpc/.dsh/attachments/v1/files/4c/4cfbc398349d11fa0c59cf2665d03ba9a6dced02555c15e7d158a855dc38f591/a8e07ca1-1b2b-4abd-9f19-07cf3bb9ca04.glb"
AQUI = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(AQUI, 'atlas.raw')
RES = 2048
SEMILLA = 20261026

d = open(SRC, 'rb').read()
clen, _ = struct.unpack_from('<II', d, 12)
j = json.loads(d[20:20 + clen].decode())
off = 12; binoff = None
while off < len(d):
    l, t = struct.unpack_from('<II', d, off)
    if t == 0x4E4942: binoff = off + 8
    off += 8 + l

def acc(i):
    a = j['accessors'][i]; bv = j['bufferViews'][a['bufferView']]
    n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3}[a['type']]
    dt = {5126: '<f4', 5123: '<u2', 5125: '<u4'}[a['componentType']]
    o = binoff + bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    arr = np.frombuffer(d, dtype=np.dtype(dt), count=a['count'] * n, offset=o)
    return arr.reshape(-1, n) if n > 1 else arr

pr = j['meshes'][0]['primitives'][0]
V = acc(pr['attributes']['POSITION']).astype(np.float64)
UV = acc(pr['attributes']['TEXCOORD_0']).astype(np.float64)
F = acc(pr['indices']).astype(np.int64).reshape(-1, 3)
print(f'original {len(V)} vertices, {len(F)} caras, {len(UV)} uv')

# --- atlas a raw RGB, reducido ---
if not os.path.exists(TEX):
    im = j['images'][0]; bv = j['bufferViews'][im['bufferView']]
    png = os.path.join(AQUI, 'atlas.png')
    open(png, 'wb').write(d[binoff + bv.get('byteOffset', 0): binoff + bv.get('byteOffset', 0) + bv['byteLength']])
    subprocess.run(['convert', png, '-colorspace', 'sRGB', '-resize', f'{RES}x{RES}!', '-depth', '8', f'rgb:{TEX}'], check=True)
    os.remove(png)
T = np.fromfile(TEX, dtype=np.uint8).reshape(RES, RES, 3)
print('atlas', T.shape)

mn = V.min(0); mx = V.max(0); sz = np.maximum(mx - mn, 1e-12)

def decimar(h):
    key = np.floor(V / h).astype(np.int64)
    uniq, inv = np.unique(key, axis=0, return_inverse=True)
    nv = len(uniq)
    V2 = np.zeros((nv, 3))
    c = np.bincount(inv, minlength=nv).astype(float)
    for a in range(3):
        V2[:, a] = np.bincount(inv, weights=V[:, a], minlength=nv) / c
    F2 = inv[F]
    m = (F2[:, 0] != F2[:, 1]) & (F2[:, 1] != F2[:, 2]) & (F2[:, 0] != F2[:, 2])
    F2 = F2[m]
    kf = np.sort(F2, axis=1)
    _, idx = np.unique(kf, axis=0, return_index=True)
    F2 = F2[np.sort(idx)]
    usados = np.unique(F2)
    remap = np.full(nv, -1, np.int64); remap[usados] = np.arange(len(usados))
    F2 = remap[F2]; V2 = V2[usados]
    cen = V2.mean(0)
    Tt = V2[F2]
    fn = np.cross(Tt[:, 1] - Tt[:, 0], Tt[:, 2] - Tt[:, 0])
    flip = (fn * (Tt.mean(1) - cen)).sum(1) < 0
    F2[flip] = F2[flip][:, ::-1]
    return V2, F2

# --- lookup espacial de la UV original mas cercana ---
paso = 0.02
C0 = V[F].mean(1)
U0 = UV[F].mean(1)
celdas = {}
for i in range(len(C0)):
    k = tuple((C0[i] // paso).astype(int))
    celdas.setdefault(k, []).append(i)
def uv_cercana(p):
    base = (p // paso).astype(int)
    mejor = -1; dmin = 1e9
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for dz in (-1, 0, 1):
                for i in celdas.get((base[0] + dx, base[1] + dy, base[2] + dz), ()):
                    dd = ((C0[i] - p) ** 2).sum()
                    if dd < dmin: dmin = dd; mejor = i
    return U0[mejor] if mejor >= 0 else np.array([0.5, 0.5])

def clasificar(V2, F2):
    Tt = V2[F2]; C = Tt.mean(1)
    n = np.cross(Tt[:, 1] - Tt[:, 0], Tt[:, 2] - Tt[:, 0])
    n /= np.linalg.norm(n, axis=1, keepdims=True) + 1e-12
    cy = (C[:, 1] - mn[1]) / sz[1]
    cz = (C[:, 2] - mn[2]) / sz[2]
    cx = C[:, 0] / max(abs(mn[0]), abs(mx[0]))
    g = np.zeros(len(F2), np.uint8)
    g[(cy > 0.55) & (cy < 0.85) & (np.abs(n[:, 1]) < 0.5)] = 1
    for zc in (-0.478, 0.589):
        d = np.hypot(C[:, 1] + 0.196, C[:, 2] - zc)
        g[(d < 0.115) & (np.abs(cx) > 0.35)] = 2
    g[(cz > 0.95) & (cy > 0.20) & (cy < 0.45) & (np.abs(cx) > 0.30) & (np.abs(cx) < 0.85)] = 3
    g[(cz < 0.05) & (cy > 0.25) & (cy < 0.45) & (np.abs(cx) > 0.35)] = 4
    # color medio por grupo, leido del atlas: sirve de paleta
    rgb = np.zeros((len(F2), 3), np.uint8)
    for i, c in enumerate(C):
        uv = uv_cercana(c)
        x = int(np.clip(uv[0] % 1.0, 0, 0.999) * RES)
        y = int(np.clip(uv[1] % 1.0, 0, 0.999) * RES)
        rgb[i] = T[y, x]
    return g, rgb

objetivos = [(3554, 0.0), (2271, 0.0)]
cache = []
for h in [0.020, 0.024, 0.028, 0.032, 0.036, 0.042, 0.046, 0.050, 0.054, 0.058, 0.064, 0.070, 0.078, 0.088]:
    V2, F2 = decimar(h)
    cache.append((h, V2, F2, len(F2)))
for h, V2, F2, n in cache:
    print(f'  h={h:.3f} -> {n} facetas')

sel = []
for obj, _ in objetivos:
    cand = min(cache, key=lambda t: abs(t[3] - obj))
    if cand[0] not in [s[0] for s in sel]:
        sel.append(cand)
    else:
        for c in sorted(cache, key=lambda t: abs(t[3] - obj)):
            if c[0] not in [s[0] for s in sel]:
                sel.append(c); break

niveles = []
for h, V2, F2, n in sel:
    g, rgb = clasificar(V2, F2)
    rep = [int((g == k).sum()) for k in range(5)]
    print(f'nivel h={h:.3f} {n} facetas  grupos {rep}')
    for k in range(5):
        m = g == k
        if m.sum():
            print(f'   grupo {k}: rgb medio {np.round(rgb[m].mean(0)).astype(int)}  n={m.sum()}')
    niveles.append((h, V2, F2, g, rgb))

# facetas.bin
with open(os.path.join(AQUI, 'facetas.bin'), 'wb') as f:
    f.write(b'ENF1'); f.write(struct.pack('<I', len(niveles)))
    for h, V2, F2, g, rgb in niveles:
        q = np.clip(np.round((V2 - mn) / sz * 65535), 0, 65535).astype('<u2')
        f.write(struct.pack('<f', h)); f.write(struct.pack('<II', len(V2), len(F2)))
        f.write(struct.pack('<3f', *mn)); f.write(struct.pack('<3f', *mx))
        f.write(q.tobytes()); f.write(F2.astype('<u2').tobytes()); f.write(g.astype('u1').tobytes()); f.write(rgb.astype('u1').tobytes())
print('facetas.bin', os.path.getsize(os.path.join(AQUI, 'facetas.bin')) // 1024, 'kB')

# facetas-web.bin
rng = np.random.default_rng(SEMILLA)
with open(os.path.join(AQUI, 'facetas-web.bin'), 'wb') as f:
    f.write(b'ENW1'); f.write(struct.pack('<I', len(niveles)))
    f.write(struct.pack('<3f', *mn)); f.write(struct.pack('<3f', *mx))
    for h, V2, F2, g, rgb in niveles:
        Tt = V2[F2]; C = Tt.mean(1)
        nn = np.cross(Tt[:, 1] - Tt[:, 0], Tt[:, 2] - Tt[:, 0])
        nn /= np.linalg.norm(nn, axis=1, keepdims=True) + 1e-12
        eje = rng.normal(size=(len(Tt), 3)); eje /= np.linalg.norm(eje, axis=1, keepdims=True) + 1e-12
        giro = (rng.random(len(Tt)) * 2 - 1)
        espera = rng.random(len(Tt))
        semilla = rng.integers(0, 65535, len(Tt))
        q = lambda X: np.clip(np.round((X - mn) / sz * 65535), 0, 65535).astype('<u2')
        qv = q(Tt.reshape(-1, 3)).reshape(-1, 3, 3); qc = q(C)
        qn = np.clip(np.round(nn * 127), -127, 127).astype('i1')
        qe = np.clip(np.round(eje * 127), -127, 127).astype('i1')
        f.write(struct.pack('<fI', h, len(Tt)))
        for t in range(len(Tt)):
            f.write(qv[t].astype('<u2').tobytes()); f.write(qc[t].astype('<u2').tobytes())
            f.write(qn[t].astype('i1').tobytes()); f.write(np.uint8(g[t]).tobytes())
            f.write(np.uint16(semilla[t]).tobytes()); f.write(qe[t].astype('i1').tobytes())
            f.write(np.uint16(round((giro[t] * 0.5 + 0.5) * 65535)).tobytes())
            f.write(np.uint16(round(espera[t] * 65535)).tobytes()); f.write(b'\0\0\0')
print('facetas-web.bin', os.path.getsize(os.path.join(AQUI, 'facetas-web.bin')) // 1024, 'kB')
