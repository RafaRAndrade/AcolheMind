// API REST do AcolheMind (MVP). Persistência em arquivo JSON: troque por Postgres/SQLite antes de produção.
const express = require('express'), cors = require('cors'), bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const SECRET = process.env.JWT_SECRET || 'troque-esta-chave-em-producao';
const FILE = process.env.DB_FILE || path.join(__dirname, 'data/db.json');
const CATS = ['Alimentação', 'Sono / Rotina', 'Gatilho / Evento', 'Crise'];

let db = { users: [], children: [], records: [], history: [] };
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
const save = () => { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(db)); };
const id = () => crypto.randomUUID();
const bad = (s, m, c = 400) => s.status(c).json({ error: m });
const day = d => d.toLocaleDateString('sv-SE');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json({ limit: '100kb' }));

const sign = u => jwt.sign({ uid: u.id }, SECRET, { expiresIn: '30d' });
function auth(q, s, n) {
  try { q.uid = jwt.verify((q.headers.authorization || '').slice(7), SECRET).uid; n(); }
  catch { bad(s, 'Não autenticado.', 401); }
}
const myChild = (q, cid) => db.children.find(c => c.id === cid && c.userId === q.uid);

// --- Autenticação ---
app.post('/api/auth/register', (q, s) => {
  const { email, password, name } = q.body || {};
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return bad(s, 'Digite um e-mail válido.');
  if (!password || password.length < 8) return bad(s, 'A senha precisa ter pelo menos 8 caracteres.');
  if (db.users.some(u => u.email === email.toLowerCase())) return bad(s, 'Este e-mail já tem cadastro.', 409);
  const u = { id: id(), email: email.toLowerCase(), name: String(name || '').slice(0, 60), hash: bcrypt.hashSync(password, 10) };
  db.users.push(u); save(); s.json({ token: sign(u) });
});
app.post('/api/auth/login', (q, s) => {
  const { email, password } = q.body || {};
  const u = db.users.find(x => x.email === String(email || '').toLowerCase());
  if (!u || !bcrypt.compareSync(String(password || ''), u.hash)) return bad(s, 'E-mail ou senha incorretos.', 401);
  s.json({ token: sign(u) });
});

// --- Crianças ---
app.get('/api/children', auth, (q, s) => s.json(db.children.filter(c => c.userId === q.uid)));
app.post('/api/children', auth, (q, s) => {
  const name = String(q.body?.name || '').trim().slice(0, 20);
  if (!name) return bad(s, 'Digite o nome da criança.');
  const c = { id: id(), userId: q.uid, name }; db.children.push(c); save(); s.status(201).json(c);
});

// --- Registros do diário ---
app.get('/api/records', auth, (q, s) => {
  const { childId, date } = q.query;
  if (!myChild(q, childId)) return bad(s, 'Criança não encontrada.', 404);
  s.json(db.records.filter(r => r.childId === childId && (!date || r.date === date)).sort((a, b) => a.time < b.time ? -1 : 1));
});
app.post('/api/records', auth, (q, s) => {
  const { childId, category, trigger, intensity, note, date, time } = q.body || {};
  if (!myChild(q, childId)) return bad(s, 'Criança não encontrada.', 404);
  if (!CATS.includes(category)) return bad(s, 'Categoria inválida.');
  if ((date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) || (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) return bad(s, 'Data ou hora inválida.');
  if (!trigger) return bad(s, 'Escolha o que pode ter contribuído.');
  if (!Number.isInteger(intensity) || intensity < 1 || intensity > 5) return bad(s, 'Intensidade deve ser de 1 a 5.');
  const now = new Date();
  const r = { id: id(), childId, category, trigger: String(trigger).slice(0, 40), intensity,
    note: String(note || '').slice(0, 500), date: date || day(now), time: time || now.toTimeString().slice(0, 5) };
  db.records.push(r); save(); s.status(201).json(r);
});
app.delete('/api/records/:id', auth, (q, s) => {
  const r = db.records.find(x => x.id === q.params.id);
  if (!r || !myChild(q, r.childId)) return bad(s, 'Registro não encontrado.', 404);
  db.records = db.records.filter(x => x !== r); save(); s.status(204).end();
});

// --- Relatório semanal (segunda a domingo) ---
app.get('/api/reports/weekly', auth, (q, s) => {
  const { childId } = q.query;
  if (!myChild(q, childId)) return bad(s, 'Criança não encontrada.', 404);
  const base = q.query.start ? new Date(q.query.start + 'T12:00:00') : new Date();
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  const days = [...Array(7)].map((_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return day(d); });
  const rs = db.records.filter(r => r.childId === childId && days.includes(r.date));
  const crises = days.map(d => rs.filter(r => r.date === d && r.category === 'Crise').length);
  const freq = {}; rs.forEach(r => freq[r.trigger] = (freq[r.trigger] || 0) + 1);
  const top = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0] || null;
  s.json({ days, crises, totalCrises: crises.reduce((a, b) => a + b, 0), topTrigger: top });
});

// --- Histórico do SOS Inteligente ---
app.get('/api/sos/history', auth, (q, s) => {
  if (!myChild(q, q.query.childId)) return bad(s, 'Criança não encontrada.', 404);
  s.json(db.history.filter(h => h.childId === q.query.childId));
});
app.post('/api/sos/history', auth, (q, s) => {
  const { childId, situationId, situationName, text } = q.body || {};
  if (!myChild(q, childId)) return bad(s, 'Criança não encontrada.', 404);
  const h = { id: id(), childId, situationId, situationName, text: String(text || '').slice(0, 500), rating: null, comment: '', createdAt: new Date().toISOString() };
  db.history.push(h); save(); s.status(201).json(h);
});
app.patch('/api/sos/history/:id', auth, (q, s) => {
  const h = db.history.find(x => x.id === q.params.id);
  if (!h || !myChild(q, h.childId)) return bad(s, 'Registro não encontrado.', 404);
  if (['bem', 'pouco', 'nao', 'pior', 'nt', null].includes(q.body?.rating)) h.rating = q.body.rating;
  if (typeof q.body?.comment === 'string') h.comment = q.body.comment.slice(0, 500);
  save(); s.json(h);
});

app.listen(process.env.PORT || 4000, () => console.log('API AcolheMind em http://localhost:' + (process.env.PORT || 4000)));
