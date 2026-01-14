'use client';

import { Trash2, Tag, Star, FileText } from 'lucide-react';

export default function DataEditor({ items, columns, onColumnChange, onChange }) {

    const updateItem = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        onChange(newItems);
    };

    const deleteItem = (index) => {
        if (!confirm('Remove this item?')) return;
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    if (!items || items.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '6rem', color: 'var(--text-secondary)', borderStyle: 'dashed', borderColor: 'var(--border-subtle)' }}>
                No products added yet. Use the URL bar above to add items.
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <tr>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', width: '80px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Preview</th>

                            {/* Editable Headers */}
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', width: '200px' }}>
                                <input
                                    value={columns.title}
                                    onChange={(e) => onColumnChange('title', e.target.value)}
                                    className="input-editable input-editable-header"
                                />
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', width: '100px' }}>
                                <input
                                    value={columns.price}
                                    onChange={(e) => onColumnChange('price', e.target.value)}
                                    className="input-editable input-editable-header"
                                />
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', width: '80px' }}>
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-secondary" />
                                    <input
                                        value={columns.stock}
                                        onChange={(e) => onColumnChange('stock', e.target.value)}
                                        className="input-editable input-editable-header"
                                    />
                                </div>
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', width: '100px' }}>
                                <div className="flex items-center gap-2">
                                    <Star size={14} className="text-secondary" />
                                    <input
                                        value={columns.rating}
                                        onChange={(e) => onColumnChange('rating', e.target.value)}
                                        className="input-editable input-editable-header"
                                    />
                                </div>
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', width: '250px' }}>
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-secondary" />
                                    <input
                                        value={columns.shortDescription}
                                        onChange={(e) => onColumnChange('shortDescription', e.target.value)}
                                        className="input-editable input-editable-header"
                                    />
                                </div>
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', width: '300px' }}>
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-secondary" />
                                    <input
                                        value={columns.longDescription}
                                        onChange={(e) => onColumnChange('longDescription', e.target.value)}
                                        className="input-editable input-editable-header"
                                    />
                                </div>
                            </th>
                            <th style={{ padding: '0.75rem 1.5rem', textAlign: 'left', width: '60px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: 'var(--bg-app)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: 'var(--radius-sm)',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {item.image ? (
                                            <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>No Img</div>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={item.title || ''}
                                            onChange={(e) => updateItem(index, 'title', e.target.value)}
                                            placeholder={columns.title}
                                            className="input-editable"
                                            style={{ fontWeight: 500 }}
                                        />
                                        <input
                                            type="text"
                                            value={item.brand || ''}
                                            onChange={(e) => updateItem(index, 'brand', e.target.value)}
                                            placeholder={columns.brand || "Brand"}
                                            className="input-editable"
                                            style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}
                                        />

                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="text"
                                            value={item.price || ''}
                                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                                            style={{ width: '80px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}
                                            placeholder="0.00"
                                        />
                                        <input
                                            type="text"
                                            value={item.currency || ''}
                                            onChange={(e) => updateItem(index, 'currency', e.target.value)}
                                            style={{ width: '50px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)' }}
                                            placeholder="EUR"
                                        />
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <input
                                            type="text"
                                            value={item.rating || ''}
                                            onChange={(e) => updateItem(index, 'rating', e.target.value)}
                                            className="input-editable"
                                            placeholder="-"
                                            style={{ width: '40px', fontWeight: 600 }}
                                        />
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                            ({item.reviewCount || 0})
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top' }}>
                                    <textarea
                                        value={item.shortDescription || item.description || ''}
                                        onChange={(e) => updateItem(index, 'shortDescription', e.target.value)}
                                        className="input-editable"
                                        style={{ width: '100%', minHeight: '60px', fontSize: '0.8rem', resize: 'vertical' }}
                                        placeholder={columns.shortDescription}
                                    />
                                </td>
                                <td style={{ padding: '1rem 1.5rem', verticalAlign: 'top', textAlign: 'right' }}>
                                    <button onClick={() => deleteItem(index)} className="btn-ghost" style={{ padding: '0.5rem', color: 'var(--text-tertiary)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
