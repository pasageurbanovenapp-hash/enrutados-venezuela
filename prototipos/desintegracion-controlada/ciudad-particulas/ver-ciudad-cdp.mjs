const puerto = Number(process.argv[2] || 9224);
const expr = process.argv[3] || "({estado: window.__ciudad ? window.__ciudad.estado() : null, meta: document.getElementById('meta').textContent})";
const lista = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
const obj = lista.find((t) => t.type === 'page' && t.url.includes('ciudad-particulas'));
if (!obj) { console.error('sin pagina', lista.map((t) => [t.type, t.url])); process.exit(1); }
const ws = new WebSocket(obj.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pend = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } };
const enviar = (method, params) => new Promise((res) => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const r = await enviar('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
console.log(JSON.stringify(r.result, null, 1));
ws.close();
