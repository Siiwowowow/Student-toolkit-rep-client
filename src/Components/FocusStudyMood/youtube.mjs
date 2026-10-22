const VIDEO_ID = /^[\w-]{11}$/;
const LIST_ID = /^[\w-]{10,100}$/;

export function parseYouTubeLink(input, mode = 'video') {
  let url;
  try { url = new URL(input.trim().replace(/^(?!https?:\/\/)/i, 'https://')); }
  catch { throw new Error('Paste a valid YouTube link.'); }
  const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
  if (!['youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host) || !['https:', 'http:'].includes(url.protocol)) {
    throw new Error('Please use a youtube.com or youtu.be link.');
  }
  const list = url.searchParams.get('list');
  if (mode === 'playlist') {
    if (!list || !LIST_ID.test(list)) throw new Error('Paste a YouTube playlist link containing a list ID.');
    return { kind: 'playlist', sourceId: list };
  }
  const parts = url.pathname.split('/').filter(Boolean);
  const video = host === 'youtu.be' ? parts[0] : ['embed', 'shorts', 'live'].includes(parts[0]) ? parts[1] : url.searchParams.get('v');
  if (!video || !VIDEO_ID.test(video)) throw new Error('Paste a video link, or choose Playlist to add a full playlist.');
  return { kind: 'video', sourceId: video };
}

export function restoreLibrary(raw) {
  try {
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved?.entries)) return { entries: [], selectedId: null };
    const seen = new Set();
    const entries = saved.entries.filter(item => {
      const valid = item && ['video', 'playlist'].includes(item.kind) && (item.kind === 'video' ? VIDEO_ID : LIST_ID).test(item.sourceId) && item.id === `${item.kind}:${item.sourceId}` && !seen.has(item.id);
      if (valid) seen.add(item.id);
      return valid;
    }).slice(0, 200).map(item => ({
      id: item.id, kind: item.kind, sourceId: item.sourceId,
      title: typeof item.title === 'string' ? item.title.slice(0, 300) : '',
      done: item.done === true,
      videos: item.kind === 'playlist' && Array.isArray(item.videos) ? item.videos.filter(id => typeof id === 'string' && VIDEO_ID.test(id)).slice(0, 500) : [],
      completed: Array.isArray(item.completed) ? item.completed.filter(id => typeof id === 'string' && VIDEO_ID.test(id)).slice(0, 500) : [],
    }));
    return { entries, selectedId: entries.some(item => item.id === saved.selectedId) ? saved.selectedId : entries[0]?.id || null };
  } catch { return { entries: [], selectedId: null }; }
}

export async function videoMetadata(id, signal) {
  const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, { signal });
  if (!response.ok) throw new Error('Video details unavailable');
  const data = await response.json();
  return { title: data.title, author: data.author_name };
}

let apiPromise;
export function loadYouTubeAPI() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const previous = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => fail(), 20000);
    function fail() {
      window.clearTimeout(timeout);
      window.onYouTubeIframeAPIReady = previous;
      script.remove();
      apiPromise = null;
      reject(new Error('YouTube could not load. Check your connection and try again.'));
    }
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      window.onYouTubeIframeAPIReady = previous;
      resolve(window.YT);
      previous?.();
    };
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return apiPromise;
}
