import React, { useState, useEffect, useCallback } from 'react';
import { getNeo4jConfig } from './neo4jConfig';
import {
  APP_NAME,
  appUrl,
  getPhoneOwner,
  MEMORY_CONTEXTS,
} from './appConfig';
import { getStickerMeta, normalizeStickers } from './stickerCatalog';

const neo4jDb = () => getNeo4jConfig().database;

const capitalizeWords = (str) => {
  if (!str) return str;
  return str.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const MyMemory = ({ driver }) => {
  const phoneOwner = getPhoneOwner();
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('time');
  const [editingTarget, setEditingTarget] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editContext, setEditContext] = useState('hallway');
  const [editImpact, setEditImpact] = useState(3);

  const loadMemory = useCallback(async () => {
    if (!driver || !phoneOwner) {
      setLoading(false);
      return;
    }

    const owner = capitalizeWords(phoneOwner);
    const session = driver.session({ database: neo4jDb() });
    try {
      const profileResult = await session.run(
        `MATCH (u:User {name: $name})
         RETURN u.name AS name,
                coalesce(u.affiliation, u.role) AS affiliation,
                u.location AS location,
                coalesce(u.email, u.website) AS email,
                u.stickers AS stickers`,
        { name: owner }
      );

      if (profileResult.records.length > 0) {
        const rec = profileResult.records[0];
        setProfile({
          name: rec.get('name'),
          affiliation: rec.get('affiliation') || '',
          location: rec.get('location') || '',
          email: rec.get('email') || '',
          stickers: normalizeStickers(rec.get('stickers')),
        });
      } else {
        setProfile({ name: owner, affiliation: '', location: '', email: '', stickers: [] });
      }

      const connResult = await session.run(
        `MATCH (owner:User {name: $name})-[r:CONNECTED_TO]->(other:User)
         RETURN other.name AS name,
                coalesce(other.affiliation, other.role) AS affiliation,
                other.stickers AS stickers,
                r.note AS note,
                r.context AS context,
                r.impact AS impact,
                r.createdAt AS createdAt
         ORDER BY r.createdAt DESC`,
        { name: owner }
      );

      setConnections(
        connResult.records.map((rec) => ({
          name: rec.get('name'),
          affiliation: rec.get('affiliation') || '',
          stickers: normalizeStickers(rec.get('stickers')),
          note: rec.get('note') || '',
          context: rec.get('context') || '',
          impact: rec.get('impact') != null ? Number(rec.get('impact')) : null,
          createdAt: rec.get('createdAt'),
        }))
      );
      setError(null);
    } catch (err) {
      console.error('Error loading memory:', err);
      setError('Could not load your memory. Check your connection and try again.');
    } finally {
      setLoading(false);
      session.close();
    }
  }, [driver, phoneOwner]);

  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  const sortedConnections = [...connections].sort((a, b) => {
    if (sortBy === 'impact') {
      return (b.impact || 0) - (a.impact || 0);
    }
    const aTime = a.createdAt != null ? Number(a.createdAt) : 0;
    const bTime = b.createdAt != null ? Number(b.createdAt) : 0;
    return bTime - aTime;
  });

  const saveEdit = async () => {
    if (!editingTarget || !driver) return;
    const owner = capitalizeWords(phoneOwner);
    const session = driver.session({ database: neo4jDb() });
    try {
      await session.run(
        `MATCH (owner:User {name: $owner})-[r:CONNECTED_TO]->(other:User {name: $target})
         SET r.note = $note, r.context = $context, r.impact = $impact`,
        {
          owner,
          target: editingTarget,
          note: editNote.trim(),
          context: editContext,
          impact: editImpact,
        }
      );
      setEditingTarget(null);
      await loadMemory();
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      session.close();
    }
  };

  const contextLabel = (id) => MEMORY_CONTEXTS.find((c) => c.id === id)?.label || id;

  if (!phoneOwner) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: 'sans-serif' }}>
        <h2>{APP_NAME}</h2>
        <p>Tap your badge once to set up this phone, then return here.</p>
        <button
          type="button"
          onClick={() => { window.location.assign(appUrl('/')); }}
          style={{ padding: '10px 20px', marginTop: '16px', cursor: 'pointer' }}
        >
          Go to graph
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'sans-serif' }}>
        Loading your conference memory…
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'sans-serif',
      minHeight: '100vh',
      backgroundColor: '#fafafa',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '22px', color: '#1a237e' }}>My Memory</h1>
        <button
          type="button"
          onClick={() => { window.location.assign(appUrl('/')); }}
          style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #ccc', cursor: 'pointer', backgroundColor: 'white' }}
        >
          View graph
        </button>
      </div>

      {error && <p style={{ color: '#c62828' }}>{error}</p>}

      {profile && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <h2 style={{ margin: '0 0 4px', fontSize: '20px' }}>{profile.name}</h2>
          {profile.affiliation && <p style={{ margin: '4px 0', color: '#555' }}>{profile.affiliation}</p>}
          {profile.location && <p style={{ margin: '4px 0', color: '#777', fontSize: '14px' }}>{profile.location}</p>}

          {profile.stickers.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {profile.stickers.map((id) => {
                const meta = getStickerMeta(id);
                return (
                  <span
                    key={id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      backgroundColor: `${meta.color}33`,
                      border: `1px solid ${meta.color}`,
                      fontSize: '13px',
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>
          Connections ({connections.length})
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc' }}
        >
          <option value="time">Sort by time</option>
          <option value="impact">Sort by impact</option>
        </select>
      </div>

      {sortedConnections.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '32px 0' }}>
          No connections yet. Tap someone's badge to start building your conference memory.
        </p>
      ) : (
        sortedConnections.map((conn) => (
          <div
            key={conn.name}
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '10px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong>{conn.name}</strong>
                {conn.affiliation && (
                  <span style={{ color: '#777', fontSize: '13px', marginLeft: '8px' }}>{conn.affiliation}</span>
                )}
              </div>
              {conn.impact != null && (
                <span style={{ fontSize: '12px', color: '#1a237e', fontWeight: 600 }}>
                  Impact {conn.impact}/5
                </span>
              )}
            </div>
            {conn.context && (
              <span style={{ fontSize: '12px', color: '#888' }}>{contextLabel(conn.context)}</span>
            )}
            {conn.note ? (
              <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#333', fontStyle: 'italic' }}>
                "{conn.note}"
              </p>
            ) : (
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#aaa' }}>No note yet</p>
            )}
            <button
              type="button"
              onClick={() => {
                setEditingTarget(conn.name);
                setEditNote(conn.note);
                setEditContext(conn.context || 'hallway');
                setEditImpact(conn.impact || 3);
              }}
              style={{
                marginTop: '10px',
                padding: '4px 10px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid #ccc',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
            >
              Edit memory
            </button>
          </div>
        ))
      )}

      {editingTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '400px',
            width: '100%',
          }}>
            <h3 style={{ marginTop: 0 }}>Edit memory — {editingTarget}</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
              {MEMORY_CONTEXTS.map((ctx) => (
                <button
                  key={ctx.id}
                  type="button"
                  onClick={() => setEditContext(ctx.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '14px',
                    border: editContext === ctx.id ? `2px solid ${ctx.color}` : '1px solid #ddd',
                    backgroundColor: editContext === ctx.id ? `${ctx.color}22` : 'white',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {ctx.label}
                </button>
              ))}
            </div>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', marginBottom: '12px', padding: '8px' }}
            />
            <label style={{ fontSize: '13px' }}>Impact: {editImpact}</label>
            <input
              type="range"
              min={1}
              max={5}
              value={editImpact}
              onChange={(e) => setEditImpact(Number(e.target.value))}
              style={{ width: '100%', display: 'block', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditingTarget(null)}>Cancel</button>
              <button type="button" onClick={saveEdit} style={{ backgroundColor: '#1a237e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMemory;
