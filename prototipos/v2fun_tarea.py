"""Cliente mínimo para V2Fun: remesh, retexture y comprobación de saldo.

Host verificado: api.v2fun.ai (la documentación publica api.v2fun.art, pero
una clave emitida en v2fun.ai NO existe en el host .art). Se puede cambiar con
V2FUN_API_BASE.

La clave NUNCA se pasa por argumento (queda visible en `ps`) ni se imprime.
Se lee, en este orden:
  1. variable de entorno V2FUN_API_KEY
  2. archivo V2FUN_API_KEY_FILE
  3. ~/.config/enrutados/landing/v2fun.key   (recomendado, fuera del repositorio)

Uso:
  python3 v2fun_tarea.py saldo
  python3 v2fun_tarea.py remesh <archivo.glb> [mesh_count]
  python3 v2fun_tarea.py retexture <asset_path|archivo.glb> "<prompt>"
  python3 v2fun_tarea.py descargar <task_uuid> remeshings|textures <destino.glb>

NO VERIFICADO EN VIVO: sin clave no se ha ejecutado contra el servicio.
"""
import base64, json, os, stat, sys, time, urllib.request, urllib.error

BASE = os.environ.get('V2FUN_API_BASE', 'https://api.v2fun.ai/api/v1')
RUTA_CLAVE = os.environ.get(
    'V2FUN_API_KEY_FILE',
    os.path.expanduser('~/.config/enrutados/landing/v2fun.key'),
)

def clave():
    v = os.environ.get('V2FUN_API_KEY')
    if v and v.strip():
        return v.strip()
    if os.path.exists(RUTA_CLAVE):
        modo = stat.S_IMODE(os.stat(RUTA_CLAVE).st_mode)
        if modo != 0o600:
            print(f'aviso: {RUTA_CLAVE} tiene permisos {oct(modo)}; deberia ser 0o600', file=sys.stderr)
        with open(RUTA_CLAVE, encoding='utf-8') as f:
            k = f.read().strip()
        if k:
            return k
    sys.exit(
        'No hay clave. Crea el archivo con permisos 600:\n'
        '  mkdir -p ~/.config/enrutados/landing && chmod 700 ~/.config/enrutados/landing\n'
        "  read -rsp 'Clave V2Fun: ' K; echo; printf '%s' \"$K\" > " + RUTA_CLAVE + '; unset K\n'
        f'  chmod 600 {RUTA_CLAVE}'
    )

def pedir(metodo, ruta, cuerpo=None):
    datos = json.dumps(cuerpo).encode() if cuerpo is not None else None
    req = urllib.request.Request(
        BASE + ruta, data=datos, method=metodo,
        headers={'Authorization': f'Bearer {clave()}', 'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        # No se imprime la clave ni la cabecera enviada.
        sys.exit(f'HTTP {e.code}: {e.read().decode()[:400]}')
    except urllib.error.URLError as e:
        sys.exit(f'No se pudo conectar: {e.reason}')

def entrada(valor):
    if os.path.exists(valor):
        with open(valor, 'rb') as f:
            return base64.b64encode(f.read()).decode()
    return valor

def esperar(tipo, uuid, cada=6, limite=120):
    for _ in range(limite):
        r = pedir('GET', f'/3d_models/{tipo}/{uuid}')
        estado = r.get('status')
        print(f'  {estado}', flush=True)
        if estado in ('COMPLETED', 'FAILED'):
            return r
        time.sleep(cada)
    sys.exit('Tiempo de espera agotado; consulta la tarea a mano.')

def enlaces(tarea):
    fuera = []
    for m in (tarea.get('metadata') or []):
        for d in (m.get('downloads') or []):
            if d.get('download_url'):
                fuera.append((d.get('asset_path'), d['download_url']))
    return fuera

def descargar(url, destino):
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with urllib.request.urlopen(url, timeout=180) as r, open(destino, 'wb') as f:
        f.write(r.read())
    return os.path.getsize(destino)

def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    modo = sys.argv[1]

    if modo == 'saldo':
        r = pedir('GET', '/balance')
        print(json.dumps(r, indent=2, ensure_ascii=False))
        return

    if modo == 'remesh':
        archivo = sys.argv[2]
        cuenta = int(sys.argv[3]) if len(sys.argv) > 3 else 3600
        print(f'remesh a {cuenta} triangulos')
        t = pedir('POST', '/3d_models/remeshings', {
            'input_model': entrada(archivo),
            'mesh_count': cuenta,
            'mesh_topology': 'triangle',
        })
        print('tarea', t.get('task_uuid'))
        r = esperar('remeshings', t['task_uuid'])
    elif modo == 'retexture':
        modelo = sys.argv[2]
        prompt = sys.argv[3] if len(sys.argv) > 3 else (
            'deep navy blue matte paint, thin cyan accent line, smoked dark glass, '
            'no text, no lettering, no logos, no license plate'
        )
        print('retexture')
        t = pedir('POST', '/3d_models/textures', {
            'input_model': entrada(modelo),
            'prompt': prompt,
            'keep_uv': False,
            'pbr_texture': False,
            'hd_texture': False,
        })
        print('tarea', t.get('task_uuid'))
        r = esperar('textures', t['task_uuid'])
    elif modo == 'descargar':
        # descargar <task_uuid> <tipo> <destino>
        uuid, tipo, destino = sys.argv[2], sys.argv[3], sys.argv[4]
        r = pedir('GET', f'/3d_models/{tipo}/{uuid}')
        lista = enlaces(r)
        if not lista:
            sys.exit('La tarea no trae enlaces de descarga.')
        print(f'descargando {lista[0][0]}')
        n = descargar(lista[0][1], destino)
        print(f'{destino}: {n/1024:.0f} kB')
    else:
        sys.exit(__doc__)

    print('estado:', r.get('status'))
    print('resultado:', r.get('result'))
    for ruta, url in enlaces(r):
        print('enlace:', ruta)
        print(url)

if __name__ == '__main__':
    main()
