export function studyNavigation(entries, selectedId, playlistIndex = 0) {
  const entryIndex = entries.findIndex(entry => entry.id === selectedId);
  const entry = entries[entryIndex];
  if (!entry) return { previous: null, next: null, videoId: null, index: 0 };
  const index = entry.kind === 'playlist' ? Math.max(0, Math.min(playlistIndex, Math.max(0, entry.videos.length - 1))) : 0;
  const previousEntry = entries[entryIndex - 1];
  const nextEntry = entries[entryIndex + 1];
  const previous = entry.kind === 'playlist' && index > 0
    ? { entryId: entry.id, index: index - 1 }
    : previousEntry ? { entryId: previousEntry.id, index: previousEntry.kind === 'playlist' ? Math.max(0, previousEntry.videos.length - 1) : 0 } : null;
  const next = entry.kind === 'playlist' && index < entry.videos.length - 1
    ? { entryId: entry.id, index: index + 1 }
    : nextEntry ? { entryId: nextEntry.id, index: 0 } : null;
  return { previous, next, videoId: entry.kind === 'playlist' ? entry.videos[index] || null : entry.sourceId, index };
}

export function completeStudyVideo(entry, videoId) {
  if (!videoId) return entry;
  const completed = [...new Set([...entry.completed, videoId])];
  const done = entry.kind === 'video' || entry.videos.length > 0 && entry.videos.every(id => completed.includes(id));
  return { ...entry, completed, done };
}
