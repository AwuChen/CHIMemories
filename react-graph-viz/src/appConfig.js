/**
 * CHI Memories app configuration — single source for branding and routing.
 */

export const APP_NAME = 'CHI Memories';
export const APP_HOMEPAGE = 'https://awuchen.github.io/CHIMemories';
export const PHONE_OWNER_KEY = 'chi_memories_phone_owner';

/** Base path for HashRouter redirects (matches package.json homepage path segment). */
export const APP_BASE_PATH = process.env.PUBLIC_URL || '/CHIMemories';

export function appUrl(hashPath = '/') {
  const path = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
  return `${APP_BASE_PATH}/#${path}`;
}

export function getPhoneOwner() {
  return localStorage.getItem(PHONE_OWNER_KEY);
}

export function setPhoneOwner(name) {
  localStorage.setItem(PHONE_OWNER_KEY, name);
}

export function clearPhoneOwner() {
  localStorage.removeItem(PHONE_OWNER_KEY);
}

/** Default Cypher query for graph + polling. Supports legacy role/website fields. */
export const DEFAULT_GRAPH_QUERY = `MATCH (u:User)-[r:CONNECTED_TO]->(v:User)
RETURN u.name AS source,
       coalesce(u.affiliation, u.role) AS sourceAffiliation,
       u.location AS sourceLocation,
       coalesce(u.email, u.website) AS sourceEmail,
       u.stickers AS sourceStickers,
       v.name AS target,
       coalesce(v.affiliation, v.role) AS targetAffiliation,
       v.location AS targetLocation,
       coalesce(v.email, v.website) AS targetEmail,
       v.stickers AS targetStickers,
       r.note AS linkNote,
       r.context AS linkContext,
       r.impact AS linkImpact,
       r.createdAt AS linkCreatedAt`;

export const MEMORY_CONTEXTS = [
  { id: 'hallway', label: 'Hallway', color: '#78909C' },
  { id: 'session', label: 'Session', color: '#5C6BC0' },
  { id: 'demo', label: 'Demo', color: '#26A69A' },
  { id: 'party', label: 'Party', color: '#EC407A' },
  { id: 'other', label: 'Other', color: '#8D6E63' },
];

export function getContextColor(contextId) {
  const ctx = MEMORY_CONTEXTS.find((c) => c.id === contextId);
  return ctx ? ctx.color : '#999';
}

export function getContextLabel(contextId) {
  if (contextId === 'demo') return 'Demo Booth';
  if (contextId === 'session') return 'Smell Workshop';
  const ctx = MEMORY_CONTEXTS.find((c) => c.id === contextId);
  return ctx ? ctx.label : contextId || '';
}

/** Graph query scoped to one attendee's memory (outgoing connections only). */
export function getViewerGraphQuery() {
  return `MATCH (viewer:User {name: $viewerName})-[r:CONNECTED_TO]->(other:User)
RETURN viewer.name AS source,
       coalesce(viewer.affiliation, viewer.role) AS sourceAffiliation,
       viewer.location AS sourceLocation,
       coalesce(viewer.email, viewer.website) AS sourceEmail,
       viewer.stickers AS sourceStickers,
       other.name AS target,
       coalesce(other.affiliation, other.role) AS targetAffiliation,
       other.location AS targetLocation,
       coalesce(other.email, other.website) AS targetEmail,
       other.stickers AS targetStickers,
       r.note AS linkNote,
       r.context AS linkContext,
       r.impact AS linkImpact,
       r.createdAt AS linkCreatedAt`;
}

export function capitalizeName(str) {
  if (!str) return str;
  return str.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}
