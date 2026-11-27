import Link from 'next/link';
export default function Nav({ on }) {
  return <nav className="nav">
    <Link href="/diario" className={on === 'diario' ? 'on' : ''}>Diário</Link>
    <Link href="/sos" className={'sosb ' + (on === 'sos' ? 'on' : '')}>SOS</Link>
  </nav>;
}
