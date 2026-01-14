'use client';

export default function Settings() {
    return (
        <div style={{ maxWidth: '800px' }}>
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>
                    Configure global application preferences.
                </p>
            </header>

            <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>General</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Settings will be available in a future update. Current version: 1.0.0
                </p>
            </div>
        </div>
    );
}
