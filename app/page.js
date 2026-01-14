'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SessionList from '@/components/SessionList';
import { ArrowRight, Loader2, Sparkles, Search } from 'lucide-react';

export default function Home() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleStartScraping = async (e) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (res.ok) {
                const session = await res.json();
                router.push(`/session/${session.id}`);
            } else {
                alert('Failed to start session');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px' }}>
            <header style={{ marginBottom: '4rem', marginTop: '2rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', padding: '0.25rem 0.75rem', borderRadius: '20px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)' }}>
                    <Sparkles size={14} className="text-muted" />
                    <span className="text-muted text-xs">AI-Powered Extraction</span>
                </div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                    Turn any website <br />
                    <span style={{ color: 'var(--text-secondary)' }}>into data.</span>
                </h1>

                <form onSubmit={handleStartScraping} style={{ maxWidth: '600px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
                        <Search size={20} />
                    </div>
                    <input
                        type="url"
                        placeholder="Paste a product URL to start..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1.25rem 1rem 1.25rem 3rem',
                            fontSize: '1rem',
                            borderRadius: '12px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}
                        required
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            position: 'absolute',
                            right: '0.5rem',
                            top: '0.5rem',
                            bottom: '0.5rem',
                            borderRadius: '8px',
                            padding: '0 1.5rem',
                            background: 'var(--text-main)',
                            color: 'var(--bg-app)',
                            fontWeight: 600
                        }}
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                    </button>
                </form>
            </header>

            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Sessions</h3>
            </div>
            <SessionList />
        </div>
    );
}
