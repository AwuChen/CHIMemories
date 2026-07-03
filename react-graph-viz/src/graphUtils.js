import { normalizeStickers } from './stickerCatalog';

export function buildNode(name, record, prefix) {
  const affiliationKey = `${prefix}Affiliation`;
  const roleKey = `${prefix}Role`;
  const emailKey = `${prefix}Email`;
  const websiteKey = `${prefix}Website`;
  const locationKey = `${prefix}Location`;
  const stickersKey = `${prefix}Stickers`;

  return {
    name,
    affiliation: record.get(affiliationKey) || record.get(roleKey) || '',
    role: record.get(affiliationKey) || record.get(roleKey) || '',
    location: record.get(locationKey) || '',
    email: record.get(emailKey) || record.get(websiteKey) || '',
    website: record.get(emailKey) || record.get(websiteKey) || '',
    stickers: normalizeStickers(record.get(stickersKey)),
    x: Math.random() * 500,
    y: Math.random() * 500,
  };
}

export function buildLink(source, target, record) {
  const link = { source, target };
  if (record) {
    if (record.has('linkNote')) link.note = record.get('linkNote') || '';
    if (record.has('linkContext')) link.context = record.get('linkContext') || '';
    if (record.has('linkImpact')) {
      const impact = record.get('linkImpact');
      link.impact = impact != null ? Number(impact) : null;
    }
    if (record.has('linkCreatedAt')) link.createdAt = record.get('linkCreatedAt');
  }
  return link;
}

export function parseGraphRecords(records) {
  const nodesMap = new Map();
  const links = [];

  records.forEach((record) => {
    if (record.has('source') && record.get('source')) {
      const source = record.get('source');
      const target = record.has('target') ? record.get('target') : null;

      if (!nodesMap.has(source)) {
        nodesMap.set(source, buildNode(source, record, 'source'));
      }
      if (target && !nodesMap.has(target)) {
        nodesMap.set(target, buildNode(target, record, 'target'));
      }
      if (target && nodesMap.has(source) && nodesMap.has(target)) {
        links.push(buildLink(source, target, record));
      }
    } else {
      record.keys.forEach((key) => {
        const node = record.get(key);
        if (node && node.properties && node.identity) {
          const name = node.properties.name || `Node-${node.identity.low}`;
          if (!nodesMap.has(name)) {
            nodesMap.set(name, {
              name,
              affiliation: node.properties.affiliation || node.properties.role || '',
              role: node.properties.affiliation || node.properties.role || '',
              location: node.properties.location || '',
              email: node.properties.email || node.properties.website || '',
              website: node.properties.email || node.properties.website || '',
              stickers: normalizeStickers(node.properties.stickers),
              x: Math.random() * 500,
              y: Math.random() * 500,
            });
          }
        }
      });
    }
  });

  return { nodes: Array.from(nodesMap.values()), links };
}
