import React, { useState } from 'react';
import { MEMORY_CONTEXTS } from './appConfig';

const MemoryModal = ({ cardUser, onSave, onSkip }) => {
  const [context, setContext] = useState('hallway');
  const [note, setNote] = useState('');
  const [impact, setImpact] = useState(3);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ note: note.trim(), context, impact });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        fontFamily: 'sans-serif',
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '20px', color: '#1a237e' }}>
          Capture this moment
        </h2>
        <p style={{ margin: '0 0 20px', color: '#666', fontSize: '14px' }}>
          You connected with <strong>{cardUser}</strong>. What made this exchange memorable?
        </p>

        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
          Where did you meet?
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {MEMORY_CONTEXTS.map((ctx) => (
            <button
              key={ctx.id}
              type="button"
              onClick={() => setContext(ctx.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: context === ctx.id ? `2px solid ${ctx.color}` : '1px solid #ddd',
                backgroundColor: context === ctx.id ? `${ctx.color}22` : 'white',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {ctx.label}
            </button>
          ))}
        </div>

        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
          Memory note (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What stood out about this conversation?"
          rows={3}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            fontSize: '14px',
            marginBottom: '16px',
            resize: 'vertical',
          }}
        />

        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
          Impact: {impact}
        </label>
        <input
          type="range"
          min={1}
          max={5}
          value={impact}
          onChange={(e) => setImpact(Number(e.target.value))}
          style={{ width: '100%', marginBottom: '20px' }}
        />

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onSkip}
            disabled={saving}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#1a237e',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {saving ? 'Saving…' : 'Save memory'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryModal;
