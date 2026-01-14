'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2, Clock } from 'lucide-react';

export default function SessionList() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    async function fetchSessions() {
        try {
            const res = await fetch('/api/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(data);
            }
        } catch (error) {
            console.error('Failed to fetch sessions', error);
        } finally {
            setLoading(false);
        }
    }

    const deleteSession = async (e, id) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm('Are you sure you want to delete this session?')) return;

        try {
            const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSessions(sessions.filter(s => s.id !== id));
            }
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        return new Date(isoString).toLocaleString('nl-NL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="text-secondary">Loading sessions...</div>;

    if (sessions.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', borderStyle: 'dashed', borderColor: 'var(--border-subtle)' }}>
                <p className="text-secondary">No sessions yet.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {sessions.map(session => (
                <Link href={`/session/${session.id}`} key={session.id} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        position: 'relative',
                        border: '1px solid var(--bg-card)',
                        overflow: 'hidden'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = 'var(--text-secondary)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = 'var(--bg-card)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div>
                            {/* Header: Favicon + Title */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <div style={{
                                    width: '32px', height: '32px',
                                    background: 'var(--bg-app)',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-subtle)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {session.favicon ? (
                                        <img src={session.favicon} alt="" style={{ width: '20px', height: '20px', borderRadius: '2px' }} />
                                    ) : (
                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{session.name.substring(0, 1).toUpperCase()}</div>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {session.name}
                                    </h3>
                                    {session.hostname && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{session.hostname}</div>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => deleteSession(e, session.id)}
                                    className="btn-ghost"
                                    style={{ color: 'var(--text-tertiary)', padding: '0.25rem', marginTop: '-0.5rem', marginRight: '-0.5rem' }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1 }}>{session.items?.length || 0}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</span>
                                </div>
                                {session.lastDuration && (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1, color: 'var(--text-secondary)' }}>
                                            {session.lastDuration}s
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Speed</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Clock size={12} />
                                <span>{formatDate(session.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
