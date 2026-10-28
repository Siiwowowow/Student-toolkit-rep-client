const VIDEO_ID = /^[\w-]{11}$/;

// Checkpoints are separate from the queue: saving time must not rerender the player.
export function createPlaybackProgress(storage, key, onError = () => {}) {
  let progress = {};
  try {
    const parsed = JSON.parse(storage.getItem(key));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) progress = parsed;
  } catch { /* Unavailable or corrupt storage must not prevent playback. */ }
  const read = entry => {
    const value = progress[entry.id];
    return value && typeof value === 'object' ? value : {};
  };
  const seconds = (entry, videoId) => {
    const value = read(entry).positions?.[videoId];
    return Number.isFinite(value) && value >= 0 ? Math.min(value, 604800) : 0;
  };
  return {
    seconds,
    resume(entry, requestedIndex) {
      const saved = read(entry);
      const explicit = Number.isInteger(requestedIndex) && requestedIndex >= 0;
      const knownIndex = entry.videos?.indexOf(saved.videoId) ?? -1;
      const fallback = Number.isInteger(saved.index) && saved.index >= 0 ? Math.min(saved.index, 499) : 0;
      const index = entry.kind === 'video' ? 0 : explicit ? requestedIndex : knownIndex >= 0 ? knownIndex : fallback;
      const videoId = entry.kind === 'video' ? entry.sourceId : entry.videos?.[index] || (!explicit && VIDEO_ID.test(saved.videoId) ? saved.videoId : null);
      return { index, videoId, seconds: seconds(entry, videoId) };
    },
    save(entry, videoId, index, time, ended = false) {
      if (!VIDEO_ID.test(videoId) || !Number.isFinite(time) || time < 0) return;
      if (entry.kind === 'video' && videoId !== entry.sourceId) return;
      const previous = read(entry);
      progress[entry.id] = {
        videoId, index: Math.max(0, Math.min(499, Number.isInteger(index) ? index : 0)),
        positions: { ...previous.positions, [videoId]: ended ? 0 : Math.min(time, 604800) },
      };
      try { storage.setItem(key, JSON.stringify(progress)); }
      catch { onError(); }
    },
  };
}
