'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Settings, Disc, LogOut, Archive } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar" style={{
            width: 'var(--sidebar-width)',
            background: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-subtle)',
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100vh',
            position: 'fixed'
        }}>
            <div>
                {/* Brand Header */}
                <div style={{ padding: '0 0.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', background: 'var(--text-main)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-app)' }}>
                        {/* Simple geometric "S" logo */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 11a4 4 0 1 1 8 0 4 4 0 0 1 8 0" />
                            <path d="M12 4v16" strokeWidth="3" />
                        </svg>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Scrappy</span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                        { name: 'Dashboard', href: '/', icon: LayoutGrid },
                        { name: 'Archive', href: '/archive', icon: Archive },
                        { name: 'Settings', href: '/settings', icon: Settings }
                    ].map(link => (
                        <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                background: pathname === link.href ? 'var(--bg-card)' : 'transparent',
                                color: pathname === link.href ? 'var(--text-main)' : 'var(--text-secondary)',
                                fontWeight: pathname === link.href ? 600 : 400
                            }}>
                                <link.icon size={20} />
                                <span>{link.name}</span>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>

            <div>
                <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600, color: 'var(--bg-app)' }}>
                        MK
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)', margin: 0 }}>Maarten K.</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Pro Plan</p>
                    </div>
                    <LogOut size={16} className="text-secondary" style={{ cursor: 'pointer' }} />
                </div>
            </div>
        </aside>
    );
}
