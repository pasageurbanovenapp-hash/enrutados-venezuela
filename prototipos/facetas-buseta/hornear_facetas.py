"""Decima la malla por agrupacion de vertices, clasifica cada faceta por region
y hornea dos archivos:

  facetas.bin      niveles de detalle indexados, con grupo por faceta (canvas)
  facetas-web.bin  no indexado, con todos los atributos por faceta (WebGL)

Grupos: 0 cuerpo, 1 cristal, 2 rueda, 3 faro, 4 ambar.
"""
import numpy as np, struct, sys, os

SRC = sys.argv[1] if len(sys.argv) > 1 else 'prototipos/5462bc21-f895-4638-a804-924b7b39900d.obj'
OUT = 'prototipos/facetas-buseta/facetas.bin'
OUTW = 'prototipos/facetas-buseta/facetas-web.bin'
SEMILLA = 20261025

V=[]; F=[]
for line in open(SRC):
    if line.startswith('v '):
        V.append([float(x) for x in line.split()[1:4]])
    elif line.startswith('f '):
        F.append([int(x.split('/')[0])-1 for x in line.split()[1:4]])
V=np.array(V,float); F=np.array(F,np.int64)

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
keep=cnt[inv]>100
F=F[keep[F].all(axis=1)]

mn=V.min(0); mx=V.max(0); sz=np.maximum(mx-mn,1e-12)

def area(T):
    return 0.5*np.linalg.norm(np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]),axis=1).sum()

area0=area(V[F])

def decimar(h):
    key=np.floor(V/h).astype(np.int64)
    uniq,inv2=np.unique(key,axis=0,return_inverse=True)
    nv=len(uniq)
    V2=np.zeros((nv,3))
    cuentas=np.bincount(inv2,minlength=nv).astype(float)
    for a in range(3):
        V2[:,a]=np.bincount(inv2,weights=V[:,a],minlength=nv)/cuentas
    F2=inv2[F]
    m=(F2[:,0]!=F2[:,1])&(F2[:,1]!=F2[:,2])&(F2[:,0]!=F2[:,2])
    F2=F2[m]
    keyf=np.sort(F2,axis=1)
    _,idx=np.unique(keyf,axis=0,return_index=True)
    F2=F2[np.sort(idx)]
    usados=np.unique(F2)
    remap=np.full(nv,-1,np.int64); remap[usados]=np.arange(len(usados))
    F2=remap[F2]; V2=V2[usados]
    cen=V2.mean(0)
    T=V2[F2]
    fn=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0])
    outward=T.mean(1)-cen
    flip=(fn*outward).sum(1)<0
    F2[flip]=F2[flip][:,::-1]
    return V2,F2

# clasificacion por region, en coordenadas normalizadas
def clasificar(V2,F2):
    T=V2[F2]; C=T.mean(1)
    n=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0])
    n/=np.linalg.norm(n,axis=1,keepdims=True)+1e-12
    cy=(C[:,1]-mn[1])/sz[1]
    cz=(C[:,2]-mn[2])/sz[2]
    cx=C[:,0]/max(abs(mn[0]),abs(mx[0]))
    g=np.zeros(len(F2),np.uint8)
    # cristales: banda de ventanas, caras verticales
    g[(cy>0.54)&(cy<0.82)&(np.abs(n[:,1])<0.5)]=1
    # ruedas: cilindro real alrededor de cada eje, solo en los costados
    yc=( -0.26 - mn[1])/sz[1]
    for zc in (0.274, 0.789):
        d=np.hypot(cy-yc, cz-zc)
        g[(d<0.085)&(np.abs(cx)>0.35)]=2
    # faros: esquinas bajas del frente
    faro=(cz>0.955)&(cy>0.26)&(cy<0.36)&(np.abs(cx)>0.52)&(np.abs(cx)<0.78)
    g[faro]=3
    # pilotos: esquinas del trasero
    amber=(cz<0.025)&(cy>0.28)&(cy<0.38)&(np.abs(cx)>0.55)&(np.abs(cx)<0.80)
    g[amber]=4
    return g

NIVELES=[0.070,0.055,0.044,0.026]
cache=[]
for h in NIVELES:
    V2,F2=decimar(h)
    g=clasificar(V2,F2)
    a=area(V2[F2])
    cache.append((h,V2,F2,g,a))
    rep=[int((g==k).sum()) for k in range(5)]
    print(f'h={h:.3f}  {len(F2):5d} facetas  area {a:.3f}  grupos cuerpo/cristal/rueda/faro/ambar = {rep}')

os.makedirs(os.path.dirname(OUT),exist_ok=True)
with open(OUT,'wb') as f:
    f.write(b'ENF1'); f.write(struct.pack('<I',len(cache)))
    for h,V2,F2,g,a in cache:
        q=np.clip(np.round((V2-mn)/sz*65535),0,65535).astype('<u2')
        f.write(struct.pack('<f',h)); f.write(struct.pack('<II',len(V2),len(F2)))
        f.write(struct.pack('<3f',*mn)); f.write(struct.pack('<3f',*mx))
        f.write(q.tobytes()); f.write(F2.astype('<u2').tobytes()); f.write(g.astype('u1').tobytes())
print(f'{OUT}  {os.path.getsize(OUT)/1024:.1f} kB')

# ---- archivo no indexado para WebGL: presets 3554 (escritorio) y 2271 (movil) ----
PRESETS=[1,0]
rng=np.random.default_rng(SEMILLA)
registros=[]
for idx in PRESETS:
    h,V2,F2,g,a=cache[idx]
    T=V2[F2]
    C=T.mean(1)
    n=np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0])
    n/=np.linalg.norm(n,axis=1,keepdims=True)+1e-12
    eje=rng.normal(size=(len(T),3)); eje/=np.linalg.norm(eje,axis=1,keepdims=True)+1e-12
    giro=(rng.random(len(T))*2-1).astype(np.float32)
    espera=rng.random(len(T)).astype(np.float32)
    semilla=rng.integers(0,65535,len(T)).astype(np.uint16)
    q=lambda X: np.clip(np.round((X-mn)/sz*65535),0,65535).astype('<u2')
    qv=q(T.reshape(-1,3)).reshape(-1,3,3)
    qc=q(C)
    qn=np.clip(np.round(n*127),-127,127).astype('i1')
    qe=np.clip(np.round(eje*127),-127,127).astype('i1')
    registros.append((h,qv,qc,qn,g,semilla,qe,giro,espera))

with open(OUTW,'wb') as f:
    f.write(b'ENW1'); f.write(struct.pack('<I',len(registros)))
    f.write(struct.pack('<3f',*mn)); f.write(struct.pack('<3f',*mx))
    for h,qv,qc,qn,g,semilla,qe,giro,espera in registros:
        nT=len(qv)
        f.write(struct.pack('<fI',h,nT))
        for t in range(nT):
            f.write(qv[t].astype('<u2').tobytes())      # 18 B posiciones
            f.write(qc[t].astype('<u2').tobytes())      # 6 B centroide
            f.write(qn[t].astype('i1').tobytes())       # 3 B normal
            f.write(np.uint8(g[t]).tobytes())           # 1 B grupo
            f.write(np.uint16(semilla[t]).tobytes())    # 2 B semilla
            f.write(qe[t].astype('i1').tobytes())       # 3 B eje
            f.write(np.float16(giro[t]).tobytes())      # 2 B giro
            f.write(np.float16(espera[t]).tobytes())    # 2 B espera
            f.write(b'\0\0\0')                          # 3 B relleno
print(f'{OUTW}  {os.path.getsize(OUTW)/1024:.1f} kB  ({sum(len(r[1]) for r in registros)} facetas, 40 B cada una)')
