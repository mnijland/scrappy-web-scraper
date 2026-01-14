'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ScraperForm from '@/components/ScraperForm';
import DataEditor from '@/components/DataEditor';
import Papa from 'papaparse';
import { ArrowLeft, Download, Upload, FileJson, Save } from 'lucide-react';
import Link from 'next/link';

export default function SessionPage() {
    const params = useParams();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Default columns
    const [columns, setColumns] = useState({
        title: '#product_name',
        price: '#product_price',
        stock: '#product_stock',
        rating: '#product_rating',
        reviewCount: '#product_reviews',
        shortDescription: '#product_short_description',
        longDescription: '#product_long_description',
        sku: '#product_sku',
        brand: '#product_brand',
        image: '#product_image',
        url: '#product_url'
    });

    useEffect(() => {
        if (params?.id) {
            fetchSession(params.id);
        }
    }, [params?.id]);

    async function fetchSession(id) {
        try {
            const res = await fetch(`/api/sessions/${id}`);
            if (!res.ok) throw new Error('Session not found');
            const data = await res.json();

            // Load custom columns if they exist
            if (data.columns) {
                setColumns(prev => ({ ...prev, ...data.columns }));
            }

            setSession(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function saveSession(updates) {
        if (!session || !params?.id) return;

        // Updates can be items or columns or anything else
        const payload = updates || {};

        // If we are strictly saving items (debounce), use that. 
        // But generalized save is better.

        // Merge with current session for immediate UI update simulation
        // Note: The caller usually updates local state first.

        setSaving(true);
        try {
            await fetch(`/api/sessions/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setSaving(false);
        }
    }

    const handleAddProduct = (products) => {
        const newItemsToAdd = Array.isArray(products) ? products : [products];
        const validItems = newItemsToAdd.filter(p => !p.error);

        if (validItems.length === 0) {
            alert("No valid products found on that page.");
            return;
        }

        const newItems = [...(session.items || []), ...validItems];
        setSession(prev => ({ ...prev, items: newItems }));
        saveSession({ items: newItems });
    };

    const handleUpdateItems = (newItems) => {
        setSession(prev => ({ ...prev, items: newItems }));
    };

    const handleColumnChange = (field, value) => {
        const newCols = { ...columns, [field]: value };
        setColumns(newCols);
        // We autosave columns too
        saveSession({ columns: newCols });
    };

    // Debounce save for items only to avoid spamming on text edit
    useEffect(() => {
        if (!session) return;
        const timer = setTimeout(() => {
            saveSession({ items: session.items });
        }, 1000);
        return () => clearTimeout(timer);
    }, [session?.items]);


    const downloadCSV = () => {
        if (!session) return;

        // Map items using the Custom Column Names
        const data = session.items.map(item => ({
            [columns.title]: item.title,
            [columns.price]: item.price,
            [columns.stock]: item.stock || '',
            [columns.rating]: item.rating || '',
            [columns.reviewCount]: item.reviewCount || '',
            [columns.shortDescription]: item.shortDescription || item.description, // Fallback
            [columns.longDescription]: item.longDescription || '',
            [columns.sku]: item.sku || '',
            [columns.brand]: item.brand,
            [columns.url]: item.url,
            [columns.image]: item.image
        }));

        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${session.name.replace(/\s+/g, '_')}.csv`;
        link.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target.result);
                const items = Array.isArray(json) ? json : (json.items || []);
                handleUpdateItems(items);
            } catch (err) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };

    const downloadJSON = () => {
        const blob = new Blob([JSON.stringify(session.items, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${session.name.replace(/\s+/g, '_')}.json`;
        link.click();
    };

    if (loading) return <div className="text-secondary" style={{ marginTop: '3rem', textAlign: 'center' }}>Loading session...</div>;
    if (!session) return <div className="text-secondary" style={{ marginTop: '3rem', textAlign: 'center' }}>Session not found.</div>;

    return (
        <div style={{ maxWidth: '1400px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <input
                            value={session.name}
                            onChange={(e) => setSession({ ...session, name: e.target.value })}
                            onBlur={() => saveSession({ name: session.name })}
                            style={{
                                fontSize: '2.25rem',
                                fontWeight: 600,
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-main)',
                                padding: 0,
                                letterSpacing: '-0.02em',
                                width: '100%',
                                outline: 'none',
                                marginBottom: '0.25rem'
                            }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="text-muted text-xs" style={{ background: 'var(--bg-card)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                                {session.items?.length || 0} ITEMS
                            </span>
                            <span className="text-muted text-xs flex-center" style={{ gap: '0.25rem' }}>
                                {saving ? 'Saving...' : <><Save size={12} /> Autosaved</>}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <label className="btn btn-secondary" style={{ cursor: 'pointer', height: '36px' }}>
                            <Upload size={16} /> Import
                            <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
                        </label>
                        <button onClick={downloadJSON} className="btn btn-secondary" style={{ height: '36px' }}>
                            <FileJson size={16} /> JSON
                        </button>
                        <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 0.5rem' }}></div>
                        <button onClick={downloadCSV} className="btn btn-primary" style={{ height: '36px', background: 'var(--text-main)', color: 'var(--bg-app)', fontWeight: 600 }}>
                            <Download size={16} /> Export to Figma
                        </button>
                    </div>
                </div>
            </div>

            <ScraperForm onScrape={handleAddProduct} />

            <DataEditor
                items={session.items}
                columns={columns}
                onChange={handleUpdateItems}
                onColumnChange={handleColumnChange}
            />
        </div>
    );
}
