import './globals.css';
import RegisterSW from '../components/RegisterSW';
export const metadata = { title: 'AcolheMind', manifest: '/manifest.json' };
export const viewport = { themeColor: '#1b6a9b', width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export default function Layout({ children }) {
  return <html lang="pt-BR"><head>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600&display=swap" rel="stylesheet" />
  </head><body><main className="app">{children}</main><RegisterSW /></body></html>;
}
