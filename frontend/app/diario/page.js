'use client';
import { useEffect, useState } from 'react';
import { api, post, tok, flush, logout, pendentes } from '../../lib/api';
import Nav from '../../components/Nav';

const CATS = ['Alimentação', 'Sono / Rotina', 'Gatilho / Evento', 'Crise'];
const CH = ['Barulho', 'Mudança de rotina', 'Fome', 'Tela', 'Sono ruim', 'Outro'];
const DL = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const iso = d => d.toLocaleDateString('sv-SE');
const segunda = () => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; };
const semana = [...Array(7)].map((_, i) => { const d = segunda(); d.setDate(d.getDate() + i); return d; });
const nivel = i => i <= 2 ? 'leve' : i === 3 ? 'média' : 'alta';

export default function Diario() {
  const [kids, setKids] = useState(null), [kid, setKid] = useState(null), [dia, setDia] = useState(iso(new Date()));
  const [recs, setRecs] = useState([]), [cat, setCat] = useState(null), [f, setF] = useState({}), [err, setErr] = useState('');
  const [rep, setRep] = useState(null), [nome, setNome] = useState('');

  useEffect(() => {
    if (!tok()) return location.replace('/login');
    flush();
    const cache = () => { const k = JSON.parse(localStorage.getItem('kids') || '[]'); setKids(k); setKid(k[0]?.id); };
    api('/children').then(k => { localStorage.setItem('kids', JSON.stringify(k)); setKids(k); setKid(k[0]?.id); })
      .catch(e => e.status === 401 ? logout(true) : cache());
  }, []);
  // Lista do dia: servidor + registros ainda na fila. Sem rede, usa a última cópia guardada no aparelho.
  const carregar = () => {
    if (!kid) return;
    const chave = `recs:${kid}:${dia}`;
    api(`/records?childId=${kid}&date=${dia}`)
      .then(r => { localStorage.setItem(chave, JSON.stringify(r)); setRecs([...r, ...pendentes(kid, dia)]); })
      .catch(e => e.status === 401 ? logout(true) : setRecs([...JSON.parse(localStorage.getItem(chave) || '[]'), ...pendentes(kid, dia)]));
  };
  useEffect(() => { carregar(); }, [kid, dia]);

  async function addKid(e) {
    e.preventDefault();
    try { const c = await api('/children', { method: 'POST', body: { name: nome } }); setKids([c]); setKid(c.id); } catch (x) { setErr(x.message); }
  }
  async function salvar() {
    if (!f.trigger || !f.intensity) return setErr('Escolha o que pode ter contribuído e a intensidade.');
    const body = { childId: kid, category: cat, trigger: f.trigger, intensity: f.intensity, note: f.note || '', date: dia, time: new Date().toTimeString().slice(0, 5) };
    try {
      await post('/records', body);
      carregar();
      setCat(null); setF({}); setErr('');
    } catch (x) { setErr(x.message); }
  }
  const abrirRel = () => api(`/reports/weekly?childId=${kid}`).then(setRep).catch(() => setErr('Relatório indisponível offline.'));

  if (!kids) return null;
  if (!kids.length) return <form onSubmit={addKid}><h1 style={{ marginTop: 24 }}>Quem vamos acompanhar?</h1>
    <p className="sub" style={{ marginBottom: 16 }}>Digite o nome da criança. Você pode adicionar outras depois.</p>
    <input placeholder="Nome da criança" value={nome} onChange={e => setNome(e.target.value)} maxLength={20} />
    <div className="err" role="alert">{err}</div><button className="pri">Salvar</button></form>;

  const crianca = kids.find(k => k.id === kid)?.name;
  return <>
    <h1>Diário</h1><p className="sub">Como está o dia de {crianca}?</p>
    <div className="wk">{semana.map((d, i) => <button key={i} className={'d' + (iso(d) === dia ? ' on' : '')} onClick={() => setDia(iso(d))}>{DL[i]}<b>{d.getDate()}</b></button>)}</div>
    <h2>O que está acontecendo?</h2>
    <div className="grid">{CATS.map(c => <button key={c} className="cat" onClick={() => { setCat(c); setF({}); setErr(''); }}>{c}</button>)}</div>
    <h2>{dia === iso(new Date()) ? 'Hoje' : dia.split('-').reverse().join('/')}</h2>
    {recs.length ? recs.map(r => <div className="card" key={r.id}><b>{r.time} · {r.category}</b>{r.note || r.trigger}<br /><small>Intensidade {r.intensity} · {nivel(r.intensity)}</small></div>)
      : <div className="card">Nenhum registro neste dia. Toque em uma opção acima para anotar o primeiro.</div>}
    <button className="sec" onClick={abrirRel}>Relatório da semana</button>
    {rep && <div className="card" style={{ marginTop: 10 }}><b>{rep.totalCrises} crise(s) na semana · mais comum: {rep.topTrigger || '—'}</b>
      <div className="bars">{rep.crises.map((n, i) => <div key={i}>{n}<i style={{ height: n ? 14 + n * 12 : 3 }} />{DL[i]}</div>)}</div></div>}
    <button className="sec" onClick={() => logout()}>Sair</button>

    {cat && <div className="sheet" role="dialog" aria-label="Registro rápido">
      <h3>Registro rápido · {cat}</h3>
      <div className="q">1. O que pode ter contribuído?</div>
      <div className="chips">{CH.map(c => <button key={c} className={'chip' + (f.trigger === c ? ' on' : '')} onClick={() => setF({ ...f, trigger: c })}>{c}</button>)}</div>
      <div className="q">2. Qual foi a intensidade? (1 leve · 5 muito intensa)</div>
      <div className="ints">{[1, 2, 3, 4, 5].map(i => <button key={i} className={'int' + (f.intensity === i ? ' on' : '')} onClick={() => setF({ ...f, intensity: i })}>{i}</button>)}</div>
      <div className="q">3. Quer anotar algo? (opcional)</div>
      <textarea maxLength={500} value={f.note || ''} onChange={e => setF({ ...f, note: e.target.value })} />
      <div className="err" role="alert">{err}</div>
      <button className="pri" onClick={salvar}>Salvar registro</button>
      {cat === 'Crise' && <a className="sec" href="/sos">Abrir o SOS</a>}
      <button className="sec" onClick={() => setCat(null)}>Cancelar</button>
    </div>}
    <Nav on="diario" />
  </>;
}
