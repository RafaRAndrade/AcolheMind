'use client';
import { useState } from 'react';
import { api, setTok } from '../../lib/api';
export default function Login() {
  const [novo, setNovo] = useState(false), [f, setF] = useState({ email: '', password: '', name: '' }), [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  async function enviar(e) {
    e.preventDefault(); setErr('');
    try { const { token } = await api(novo ? '/auth/register' : '/auth/login', { method: 'POST', body: f }); setTok(token); location.replace('/diario'); }
    catch (x) { setErr(x.status ? x.message : 'Sem conexão. Tente novamente quando estiver online.'); }
  }
  return <form onSubmit={enviar}>
    <h1 style={{ marginTop: 24 }}>{novo ? 'Criar conta' : 'Entrar'}</h1>
    <p className="sub" style={{ marginBottom: 18 }}>{novo ? 'Seu espaço para registrar e entender o dia a dia.' : 'Que bom ter você de volta.'}</p>
    {novo && <input placeholder="Seu nome" value={f.name} onChange={set('name')} autoComplete="name" />}
    <input type="email" placeholder="voce@exemplo.com" value={f.email} onChange={set('email')} autoComplete="email" required />
    <input type="password" placeholder="Senha (mínimo 8 caracteres)" value={f.password} onChange={set('password')} autoComplete={novo ? 'new-password' : 'current-password'} required />
    <div className="err" role="alert">{err}</div>
    <button className="pri">{novo ? 'Criar conta' : 'Entrar'}</button>
    <button type="button" className="sec" onClick={() => { setNovo(!novo); setErr(''); }}>{novo ? 'Já tenho conta' : 'Criar conta'}</button>
  </form>;
}
