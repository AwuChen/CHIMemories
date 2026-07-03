/**
 * CHI badge sticker catalog — maps sticker IDs to display metadata.
 */

export const STICKER_CATALOG = {
  first_chi: { label: 'First CHI', emoji: '🎉', color: '#FFD54F' },
  presenter: { label: 'Presenter', emoji: '⭐', color: '#42A5F5' },
  interactivity: { label: 'Interactivity', emoji: '🎮', color: '#AB47BC' },
  rejected_author: { label: 'Rejected Author', emoji: '📝', color: '#EF5350' },
  student: { label: 'Student', emoji: '🎓', color: '#66BB6A' },
  volunteer: { label: 'Volunteer', emoji: '🙋', color: '#FFA726' },
  sponsor: { label: 'Sponsor', emoji: '🏢', color: '#78909C' },
};

export function getStickerMeta(stickerId) {
  return STICKER_CATALOG[stickerId] || {
    label: stickerId,
    emoji: '🏷️',
    color: '#BDBDBD',
  };
}

export function normalizeStickers(stickers) {
  if (!stickers) return [];
  if (Array.isArray(stickers)) return stickers.filter(Boolean);
  if (typeof stickers === 'string') {
    return stickers.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
