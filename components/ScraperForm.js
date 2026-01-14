'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export default function ScraperForm({ onScrape }) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) throw new Error('Failed to scrape URL');

            const data = await res.json();

            // Data is now an Array
            onScrape(data);

            setUrl('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste product URL (or category page) here..."
                        style={{ paddingLeft: '40px' }}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '120px' }}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Fetch Data'}
                </button>
            </div>
            {error && <p style={{ color: '#ef4444', marginTop: '0.75rem', fontSize: '0.875rem' }}>{error}</p>}
        </form>
    );
}
