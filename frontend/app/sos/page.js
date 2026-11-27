'use client';
import { useState } from 'react';
import { analisar, AVISO } from '../../lib/sos';
import { post, tok } from '../../lib/api';
import Nav from '../../components/Nav';

const Lista = ({ t, items, ol }) => { const L = ol ? 'ol' : 'ul'; return <><h4>{t}</h4><L>{items.map((x, i) => <li key={i}>{x}</li>)}</L></>; };

export default function SOS() {
  const [msgs, setMsgs] = useState([]), [txt, setTxt] = useState(''), [err, setErr] = useState('');
  function enviar() {
    const v = txt.trim();
    if (!v) return setErr('Escreva uma mensagem: conte com suas palavras o que está acontecendo.');
    const r = analisar(v); setErr(''); setTxt('');
    setMsgs(m => [...m, { w: 'u', t: v }, { w: 'b', r }]);
    if (r.tipo === 'sit' && tok()) {
      const kid = JSON.parse(localStorage.getItem('kids') || '[]')[0]?.id;
      if (kid) post('/sos/history', { childId: kid, situationId: r.s.id, situationName: r.s.nome, text: v }).catch(() => {});
    }
  }
  return <>
    <h1>SOS Inteligente</h1>
    <p className="sub">Conte o que está acontecendo agora. Funciona sem internet. Em risco imediato, ligue 192 (SAMU).</p>
    {msgs.map((m, i) => m.w === 'u' ? <div className="mu" key={i}><div className="bu">{m.t}</div></div>
      : m.r.tipo === 'emg' ? <div className="bb emg" key={i}><p><b>Isso pode ser uma emergência</b></p>
        <p>Se há dificuldade para respirar, desmaio, convulsão, algo perigoso engolido, sangramento importante ou risco de vida, ligue 192 (SAMU) agora. Para apoio emocional a você, o CVV atende no 188, 24 horas.</p>
        <a className="pri" style={{ background: '#c0392b' }} href="tel:192">Ligar para 192</a></div>
      : m.r.tipo === 'g' ? <div className="bb" key={i}>Quero entender melhor o que está acontecendo. Você pode me contar um pouco mais sobre a situação?</div>
      : <div className="bb" key={i}><p>{m.r.s.resp.ac}</p><h4>Possível explicação</h4><p>{m.r.s.resp.pode}</p>
        <Lista ol t="O que fazer agora" items={m.r.s.resp.fazer} /><Lista t="O que evitar" items={m.r.s.resp.evitar} />
        <Lista t="Quando procurar ajuda" items={m.r.s.resp.ajuda} />
        {m.r.outros.length > 0 && <p className="sub">Também percebi sinais de: {m.r.outros.join('; ').toLowerCase()}.</p>}
        <p style={{ marginTop: 8 }}><a href="tel:192">Emergência: ligar para 192 (SAMU)</a></p></div>)}
    <textarea maxLength={500} placeholder="Descreva com suas palavras o que está acontecendo..." value={txt} onChange={e => setTxt(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }} />
    <div className="err" role="alert">{err}</div>
    <button className="pri" onClick={enviar}>Enviar mensagem</button>
    <p className="aviso">{AVISO}</p>
    <Nav on="sos" />
  </>;
}
