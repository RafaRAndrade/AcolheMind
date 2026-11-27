const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export const tok = () => localStorage.getItem('token');
export const setTok = t => localStorage.setItem('token', t);
const lerFila = () => JSON.parse(localStorage.getItem('queue') || '[]');

// Sai da conta. Limpa token e dados das crianças do aparelho (e o cache do Service Worker).
// `manterFila`: em sessão expirada (401), preserva registros ainda não enviados para não perdê-los.
export async function logout(manterFila = false) {
  if (!manterFila) await flush().catch(() => {});
  const fila = manterFila ? localStorage.getItem('queue') : null;
  localStorage.clear();
  if (fila) localStorage.setItem('queue', fila);
  try { if (window.caches) await Promise.all((await caches.keys()).map(k => caches.delete(k))); } catch {}
  location.replace('/login');
}

export async function api(path, { method = 'GET', body } = {}) {
  const r = await fetch(BASE + path, { method,
    headers: { 'Content-Type': 'application/json', ...(tok() ? { Authorization: 'Bearer ' + tok() } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.error || 'Algo deu errado.'), { status: r.status });
  return j;
}
// POST com fila offline: sem rede, guarda no aparelho e envia quando voltar a conexão.
export async function post(path, body) {
  try { return await api(path, { method: 'POST', body }); }
  catch (e) {
    if (e.status) throw e;
    const q = lerFila(); q.push({ path, body });
    localStorage.setItem('queue', JSON.stringify(q)); return { queued: true };
  }
}
// Registros do diário ainda na fila (não enviados), para mostrar na lista mesmo offline.
export const pendentes = (childId, date) => lerFila()
  .filter(x => x.path === '/records' && x.body.childId === childId && x.body.date === date)
  .map((x, i) => ({ ...x.body, id: 'local' + i }));
// Envia a fila em ordem. Para (mantendo os itens) se estiver offline, com sessão expirada (401) ou com erro do servidor (5xx);
// só descarta itens que o servidor rejeitou como inválidos (outros 4xx).
export async function flush() {
  if (!tok()) return;
  let q = lerFila();
  while (q.length) {
    try { await api(q[0].path, { method: 'POST', body: q[0].body }); }
    catch (e) { if (!e.status || e.status === 401 || e.status >= 500) break; }
    q.shift(); localStorage.setItem('queue', JSON.stringify(q));
  }
}
