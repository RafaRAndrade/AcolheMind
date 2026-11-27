// Triagem do SOS Inteligente: roda no aparelho, por isso funciona sem internet.
import data from '../data/sos.json';
// Padrões extras de emergência (respiração), somados à regex vinda do protótipo.
// Ficam aqui para não serem perdidos quando `npm run extract-sos` regenerar o sos.json.
const EMG_EXTRA = 'nao (consegue|consigo|esta conseguindo|estou conseguindo) respirar|nao esta respirando|nao estou respirando|respira(ndo)? com dificuldade|respirando mal|respiracao (dificil|ofegante)|ofegante|ofegando|sem folego|chiado no peito|pegando ar';
export const SIT = data.sit, EMG = new RegExp(data.emg + '|' + EMG_EXTRA);
export const nz = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/auto[\s-]+agress/g, 'autoagress').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const tem = (n, p) => p.endsWith('*') ? n.includes(' ' + p.slice(0, -1)) : n.includes(' ' + p + ' ');
const pontua = (n, s) => {
  let sc = 0;
  s.kw.forEach(k => { if (tem(n, k)) sc += k.includes(' ') ? 3 : 2; });
  s.all.forEach(g => { if (g.every(l => l.some(k => tem(n, k)))) sc += 3; });
  return sc;
};
export function analisar(txt) {
  const n = ' ' + nz(txt) + ' ';
  if (EMG.test(n)) return { tipo: 'emg' };
  const c = SIT.map(s => ({ s, p: pontua(n, s) })).filter(x => x.p > 0);
  if (!c.length) return { tipo: 'g' };
  c.sort((a, b) => b.s.pri - a.s.pri || b.p - a.p);
  return { tipo: 'sit', s: c[0].s, outros: c.slice(1, 3).map(x => x.s.nome) };
}
export const AVISO = 'As orientações são sugestões de apoio e não substituem acompanhamento psicológico, avaliação médica ou atendimento profissional.';
