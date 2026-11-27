'use client';
import { useEffect } from 'react';
import { tok } from '../lib/api';
export default function Home() { useEffect(() => { location.replace(tok() ? '/diario' : '/login'); }, []); return null; }
