"""Hornea una nube de puntos desde el OBJ de la buseta.

Fuera del build. Determinista: semilla fija. Salida: nube.bin
  cabecera: b'ENP1' + uint32 n + float32 min[3] + float32 max[3]
  puntos:   uint16 x,y,z  +  int8 nx,ny,nz
"""
import numpy as np, struct, sys, os

SRC = sys.argv[1] if len(sys.argv) > 1 else 'prototipos/5462bc21-f895-4638-a804-924b7b39900d.obj'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'prototipos/nube-buseta/nube.bin'
N   = int(sys.argv[3]) if len(sys.argv) > 3 else 40000
SEMILLA = 20261025

V=[]; F=[]
for line in open(SRC):
    if line.startswith('v '):
        V.append([float(x) for x in line.split()[1:4]])
    elif line.startswith('f '):
        F.append([int(x.split('/')[0])-1 for x in line.split()[1:4]])
V=np.array(V,float); F=np.array(F,np.int64)
print(f'OBJ  vertices {len(V)}  caras {len(F)}')

# --- descartar islas diminutas (triangulos sueltos) ---
parent=np.arange(len(V))
def find(x):
    while parent[x]!=x:
        parent[x]=parent[parent[x]]; x=parent[x]
    return x
for a,b,c in F:
    for x,y in ((a,b),(b,c)):
        rx,ry=find(x),find(y)
        if rx!=ry: parent[ry]=rx
roots=np.array([find(i) for i in range(len(V))])
_,inv,cnt=np.unique(roots,return_inverse=True,return_counts=True)
keep=(cnt[inv]>100)
face_keep=keep[F].all(axis=1)
print(f'caras conservadas {face_keep.sum()} de {len(F)} (descartadas {len(F)-face_keep.sum()})')
F=F[face_keep]
Vused=np.unique(F)
print(f'vertices usados {len(Vused)}')

T=V[F]
e1=T[:,1]-T[:,0]; e2=T[:,2]-T[:,0]
cr=np.cross(e1,e2)
ln=np.linalg.norm(cr,axis=1)
areas=0.5*ln
nrm=cr/np.maximum(ln,1e-12)[:,None]

vol=np.einsum('ij,ij->i',T[:,0],np.cross(T[:,1],T[:,2])).sum()/6.0
print(f'volumen firmado {vol:.4f}  ->  normales {"hacia fuera" if vol>0 else "hacia dentro (se invierten)"}')
if vol<0:
    nrm=-nrm; F=F[:,::-1]; T=V[F]
print(f'area total {areas.sum():.4f}')

rng=np.random.default_rng(SEMILLA)
pick=rng.choice(len(T),size=N,p=(areas/areas.sum()))
r1=np.sqrt(rng.random(N)); r2=rng.random(N)
P=(T[pick,0]*(1-r1)[:,None]+T[pick,1]*(r1*(1-r2))[:,None]+T[pick,2]*(r1*r2)[:,None])
Nn=nrm[pick]

mn=P.min(0); mx=P.max(0)
Q=np.clip(np.round((P-mn)/np.maximum(mx-mn,1e-12)*65535),0,65535).astype('<u2')
NQ=np.clip(np.round(Nn*127),-127,127).astype('i1')

os.makedirs(os.path.dirname(OUT),exist_ok=True)
with open(OUT,'wb') as f:
    f.write(b'ENP1'); f.write(struct.pack('<I',N))
    f.write(struct.pack('<3f',*mn)); f.write(struct.pack('<3f',*mx))
    f.write(Q.tobytes()); f.write(NQ.tobytes())

raw=os.path.getsize(OUT)
print(f'puntos {N}  bbox {np.round(mn,3)} .. {np.round(mx,3)}')
print(f'{OUT}  {raw/1024:.1f} kB  ({raw/N:.2f} B/punto)')
