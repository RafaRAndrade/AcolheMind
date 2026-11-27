'use client';
import { useEffect } from 'react';
import { flush } from '../lib/api';
export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    window.addEventListener('online', flush); flush();
    return () => window.removeEventListener('online', flush);
  }, []);
  return null;
}
