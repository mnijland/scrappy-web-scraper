'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Trash2, ArrowRight, Calendar, Globe, Box } from 'lucide-react';

export default function ArchivePage() {
    const [sessions, setSessions] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    async function fetchSessions() {
        try {
            const res = await fetch('/api/sessions');
            if (res.ok) {
                const data = await res.json();
                // Sort by updated descending
                data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                setSessions(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const deleteSession = async (e, id) => {
        e.preventDefault();
        if (!confirm('Are you sure you want to delete this session?')) return;
        try {
            await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
            setSessions(sessions.filter(s => s.id !== id));
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('nl-NL', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Filter logic
    const filteredSessions = sessions.filter(s => {
        const query = search.toLowerCase();
        return (
            (s.name && s.name.toLowerCase().includes(query)) ||
            (s.hostname && s.hostname.toLowerCase().includes(query))
        );
    });

    if (loading) return <div className="text-secondary" style={{ marginTop: '2rem' }}>Loading archive...</div>;

    return (
        <div style={{ maxWidth: '1000px' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Archive</h1>
                <p className="text-secondary">Manage and search through all your scraping sessions.</p>
            </header>

            {/* Search Bar */}
            <div className="card" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <Search size={18} className="text-secondary" style={{ marginLeft: '0.5rem' }} />
                <input
                    type="text"
                    placeholder="Search sessions by name or domain..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ border: 'none', background: 'transparent', padding: '0.5rem', fontSize: '0.95rem' }}
                />
            </div>

            {/* List View */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Session</th>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Items</th>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>Last Updated</th>
                            <th style={{ textAlign: 'right', padding: '1rem', width: '80px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSessions.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No sessions found.
                                </td>
                            </tr>
                        ) : (
                            filteredSessions.map(session => (
                                <tr key={session.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '40px', height: '40px',
                                                background: 'var(--bg-app)',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-subtle)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {session.favicon ? (
                                                    <img src={session.favicon} alt="" style={{ width: '24px', height: '24px' }} />
                                                ) : (
                                                    <Box size={20} className="text-secondary" />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{session.name}</div>
                                                {session.hostname && (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Globe size={10} /> {session.hostname}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            background: 'var(--bg-app)',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            border: '1px solid var(--border-subtle)'
                                        }}>
                                            {session.items?.length || 0}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={14} />
                                            {formatDate(session.updatedAt)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button onClick={(e) => deleteSession(e, session.id)} className="btn-ghost" style={{ padding: '0.5rem' }}>
                                                <Trash2 size={16} />
                                            </button>
                                            <Link href={`/session/${session.id}`} className="btn btn-secondary" style={{ padding: '0.5rem', height: '32px' }}>
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
