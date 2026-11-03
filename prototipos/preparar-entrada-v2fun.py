"""Convierte el OBJ limpio de la buseta en un GLB sin textura, listo para
subir a una herramienta de remesh/retexture.

Salida: prototipos/buseta-entrada.glb
"""
import json, struct, os
import numpy as np

OBJ = 'prototipos/5462bc21-f895-4638-a804-924b7b39900d.obj'
OUT = 'prototipos/buseta-entrada.glb'

V=[]; F=[]
for line in open(OBJ):
    if line.startswith('v '): V.append([float(x) for x in line.split()[1:4]])
    elif line.startswith('f '): F.append([int(x.split('/')[0])-1 for x in line.split()[1:4]])
V=np.array(V, np.float32); F=np.array(F, np.int64)

# descartar islas diminutas
parent=np.arange(len(V))
def find(x):
    while parent[x]!=x: parent[x]=parent[parent[x]]; x=parent[x]
    return x
for a,b,c in F:
    for x,y in ((a,b),(b,c)):
        rx,ry=find(x),find(y)
        if rx!=ry: parent[ry]=rx
roots=np.array([find(i) for i in range(len(V))])
_,inv,cnt=np.unique(roots,return_inverse=True,return_counts=True)
keep=cnt[inv]>100
F=F[keep[F].all(axis=1)]
usados=np.unique(F)
remap=np.full(len(V),-1,np.int64); remap[usados]=np.arange(len(usados))
V=V[usados]; F=remap[F]

# normales por vertice
N=np.zeros_like(V)
t=V[F]
fn=np.cross(t[:,1]-t[:,0], t[:,2]-t[:,0])
for k in range(3):
    np.add.at(N, F[:,k], fn)
ln=np.linalg.norm(N,axis=1,keepdims=True); N=np.divide(N, np.maximum(ln,1e-12), out=np.zeros_like(N), where=ln>1e-12)

idx=F.reshape(-1).astype(np.uint32)
pos=V.tobytes(); nor=N.tobytes(); ind=idx.tobytes()
def pad4(b, fill=b'\0'): return b + fill * ((4 - len(b)%4) % 4)
pos=pad4(pos); nor=pad4(nor); ind=pad4(ind)
blob=pos+nor+ind

j={
 "asset":{"version":"2.0","generator":"Enrutados · preparacion de entrada"},
 "scene":0,
 "scenes":[{"nodes":[0]}],
 "nodes":[{"mesh":0,"name":"buseta"}],
 "meshes":[{"name":"buseta","primitives":[{"attributes":{"POSITION":0,"NORMAL":1},"indices":2,"mode":4}]}],
 "accessors":[
   {"bufferView":0,"componentType":5126,"count":int(len(V)),"type":"VEC3",
    "min":[float(x) for x in V.min(0)],"max":[float(x) for x in V.max(0)]},
   {"bufferView":1,"componentType":5126,"count":int(len(V)),"type":"VEC3"},
   {"bufferView":2,"componentType":5125,"count":int(len(idx)),"type":"SCALAR"}],
 "bufferViews":[
   {"buffer":0,"byteOffset":0,"byteLength":int(len(pos)),"target":34962},
   {"buffer":0,"byteOffset":int(len(pos)),"byteLength":int(len(nor)),"target":34962},
   {"buffer":0,"byteOffset":int(len(pos)+len(nor)),"byteLength":int(len(ind)),"target":34963}],
 "buffers":[{"byteLength":int(len(blob))}]
}
js=json.dumps(j,separators=(',',':')).encode()
js=pad4(js,b' ')
total=12+8+len(js)+8+len(blob)
with open(OUT,'wb') as f:
    f.write(struct.pack('<4sII', b'glTF', 2, total))
    f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
    f.write(struct.pack('<II', len(blob), 0x004E4942)); f.write(blob)
print(f'{OUT}: {os.path.getsize(OUT)/1024:.0f} kB · {len(V)} vertices · {len(F)} triangulos')
