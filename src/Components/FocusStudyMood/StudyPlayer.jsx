import { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize, Minimize, RefreshCw } from 'lucide-react';
import { loadYouTubeAPI } from './youtube.mjs';
import { createPlaybackProgress } from './playback-progress.mjs';

function loadSource(player, entry, autoplay, startIndex, startSeconds = 0) {
  if (entry.kind === 'playlist') {
    const options = { listType: 'playlist', list: entry.sourceId, index: startIndex, startSeconds };
    if (autoplay) player.loadPlaylist(options);
    else player.cuePlaylist(options);
  } else if (autoplay) player.loadVideoById({ videoId: entry.sourceId, startSeconds });
  else player.cueVideoById({ videoId: entry.sourceId, startSeconds });
}

export default function StudyPlayer({ entry, playerRef, onPlaylist, onActive, onComplete, onNext, onReadyChange, autoplay, startIndex, storageKey, onStorageError }) {
  const source = useRef(entry);
  const playback = useRef({ autoplay, startIndex });
  const loadedSource = useRef(entry.id);
  const changeSource = useRef(null);
  useEffect(() => {
    source.current = entry;
    playback.current = { autoplay, startIndex };
    const player = playerRef.current;
    if (!player || loadedSource.current === entry.id) return;
    loadedSource.current = entry.id;
    changeSource.current?.(entry, autoplay, startIndex);
    setError('');
    setLoading(false);
    callbacks.current.onReadyChange(true);
  }, [entry, playerRef, startIndex, autoplay]);
  const host = useRef(null);
  const viewport = useRef(null);
  const shell = useRef(null);
  const stage = useRef(null);
  const expandButton = useRef(null);
  const lastSize = useRef(null);
  const callbacks = useRef({ onPlaylist, onActive, onComplete, onNext, onReadyChange, onStorageError });
  useEffect(() => { callbacks.current = { onPlaylist, onActive, onComplete, onNext, onReadyChange, onStorageError }; });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [reservedHeight, setReservedHeight] = useState(0);

  const resizePlayer = useCallback(() => {
    const rect = viewport.current?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return;
    const width = Math.floor(rect.width), height = Math.floor(rect.height);
    const player = playerRef.current;
    if (lastSize.current?.width === width && lastSize.current?.height === height && lastSize.current?.player === player) return;
    lastSize.current = { width, height, player };
    const iframe = host.current?.querySelector('iframe');
    if (iframe) { iframe.width = String(width); iframe.height = String(height); }
    player?.setSize?.(width, height);
  }, [playerRef]);

  useEffect(() => {
    let frame;
    const scheduleResize = () => {
      resizePlayer();
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(resizePlayer);
    };
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(scheduleResize) : null;
    if (viewport.current) observer?.observe(viewport.current);
    window.addEventListener('resize', scheduleResize);
    window.addEventListener('orientationchange', scheduleResize);
    window.visualViewport?.addEventListener('resize', scheduleResize);
    scheduleResize();
    return () => {
      observer?.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', scheduleResize);
      window.removeEventListener('orientationchange', scheduleResize);
      window.visualViewport?.removeEventListener('resize', scheduleResize);
    };
  }, [resizePlayer]);

  useEffect(() => {
    if (!expanded) return;
    const before = document.body.style.overflow;
    const button = expandButton.current;
    document.body.style.overflow = 'hidden';
    let nativeStarted = false;
    const onFullscreenChange = () => {
      const element = document.fullscreenElement || document.webkitFullscreenElement;
      if (element && shell.current?.contains(element)) nativeStarted = true;
      else if (nativeStarted) setExpanded(false);
    };
    const onKeyDown = event => {
      if (event.key !== 'Escape') return;
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (document.fullscreenElement || document.webkitFullscreenElement) Promise.resolve(exit?.call(document)).catch(() => {});
      setExpanded(false);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('keydown', onKeyDown);
    onFullscreenChange();
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('keydown', onKeyDown);
      button?.focus({ preventScroll: true });
    };
  }, [expanded]);

  const toggleFullscreen = async () => {
    if (expanded) {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen;
        try { await exit?.call(document); } catch { /* Expanded view can always be closed. */ }
      }
      setExpanded(false);
      return;
    }
    setReservedHeight(stage.current?.getBoundingClientRect().height || 0);
    setExpanded(true);
    const request = shell.current?.requestFullscreen || shell.current?.webkitRequestFullscreen;
    try { await request?.call(shell.current); } catch { /* Use the full viewport on browsers without native element fullscreen. */ }
  };

  useEffect(() => {
    let disposed = false;
    let player;
    let poll;
    let readyTimeout;
    let playlistReported = false;
    let lastVideo;
    let lastIndex = -1;
    let finishedVideo;
    let activeEntry = source.current;
    let pendingResume;
    let lastSavedAt = 0;
    // Access localStorage lazily, including browsers that block its getter.
    const progress = createPlaybackProgress({
      getItem: key => window.localStorage.getItem(key),
      setItem: (key, value) => window.localStorage.setItem(key, value),
    }, `${storageKey}:playback-v1`, () => callbacks.current.onStorageError?.());
    const checkpoint = (force = false) => {
      if (!player || pendingResume || !lastVideo) return;
      const state = player.getPlayerState?.();
      const data = player.getVideoData?.();
      // Never attribute the outgoing lesson's timestamp to an incoming video.
      if (data?.video_id !== lastVideo || ![0, 1, 2].includes(state)) return;
      if (!force && Date.now() - lastSavedAt < 5000) return;
      progress.save(activeEntry, lastVideo, lastIndex, player.getCurrentTime?.(), state === 0);
      lastSavedAt = Date.now();
    };
    const saveOnHide = () => checkpoint(true);
    window.addEventListener('pagehide', saveOnHide);
    document.addEventListener('visibilitychange', saveOnHide);
    callbacks.current.onReadyChange(false);
    const fail = message => { if (!disposed) { callbacks.current.onReadyChange(false); setError(message); setLoading(false); } };
    loadYouTubeAPI().then(YT => {
      if (disposed) return;
      const iframe = document.createElement('iframe');
      const params = new URLSearchParams({ enablejsapi: '1', origin: window.location.origin, playsinline: '1', fs: '1', rel: '0', controls: '1', autoplay: autoplay ? '1' : '0' });
      if (entry.kind === 'playlist') { params.set('listType', 'playlist'); params.set('list', entry.sourceId); }
      iframe.src = `https://www.youtube.com/embed/${entry.kind === 'video' ? entry.sourceId : 'videoseries'}?${params}`;
      iframe.title = entry.title || 'YouTube study class';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      const initialSize = viewport.current.getBoundingClientRect();
      iframe.width = String(Math.floor(initialSize.width));
      iframe.height = String(Math.floor(initialSize.height));
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      // Keep normal player controls, while preventing links from opening other windows.
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
      host.current.replaceChildren(iframe);
      readyTimeout = window.setTimeout(() => fail('The player is taking too long to load. Check your connection, then retry.'), 25000);
      const inspect = () => {
        if (disposed || !player?.getVideoData) return;
        const data = player.getVideoData();
        const index = Math.max(0, player.getPlaylistIndex?.() || 0);
        const ids = player.getPlaylist?.();
        const resumingSource = Boolean(pendingResume);
        if (pendingResume) {
          const targetIndex = ids?.length ? Math.min(pendingResume.index, ids.length - 1) : pendingResume.index;
          const targetVideo = activeEntry.kind === 'video' ? activeEntry.sourceId : ids?.[targetIndex];
          if (!targetVideo || data?.video_id !== targetVideo || (activeEntry.kind === 'playlist' && index !== targetIndex)) return;
          pendingResume = null;
        }
        if (data?.video_id && (data.video_id !== lastVideo || index !== lastIndex)) {
          lastVideo = data.video_id;
          lastIndex = index;
          const savedTime = progress.seconds(activeEntry, lastVideo);
          if (savedTime > 0 && !resumingSource) player.seekTo(savedTime, true);
          callbacks.current.onActive(data.video_id, index, data.title);
        }
        if (source.current.kind === 'playlist' && ids?.length && playlistReported !== source.current.id) {
          playlistReported = source.current.id;
          callbacks.current.onPlaylist(ids);
        }
        checkpoint();
      };
      player = new YT.Player(iframe, { events: {
        onReady: () => {
          if (disposed) return;
          playerRef.current = player;
          player.saveStudyProgress = () => checkpoint(true);
          changeSource.current = (nextEntry, play, index) => {
            checkpoint(true);
            activeEntry = nextEntry;
            lastVideo = null;
            lastIndex = -1;
            finishedVideo = null;
            playlistReported = false;
            pendingResume = progress.resume(nextEntry, index);
            loadSource(player, nextEntry, play, pendingResume.index, pendingResume.seconds);
          };
          changeSource.current(source.current, playback.current.autoplay, playback.current.startIndex);
          loadedSource.current = source.current.id;
          resizePlayer();
          window.clearTimeout(readyTimeout);
          setLoading(false);
          callbacks.current.onReadyChange(true);
          inspect();
          checkpoint(true);
          poll = window.setInterval(inspect, 1000);
        },
        onStateChange: event => {
          if (disposed) return;
          inspect();
          checkpoint(true);
          if (event.data === 1) finishedVideo = null;
          if (event.data === 0 && !pendingResume && lastVideo && finishedVideo !== lastVideo) {
            finishedVideo = lastVideo;
            callbacks.current.onComplete(lastVideo);
            const ids = player.getPlaylist?.() || [];
            if (source.current.kind === 'video' || player.getPlaylistIndex() >= ids.length - 1) callbacks.current.onNext();
          }
        },
        onError: event => fail(({ 2: 'This YouTube link is invalid.', 100: 'This video is private, deleted, or unavailable.', 101: 'The owner does not allow this class to play on other websites.', 150: 'The owner does not allow this class to play on other websites.', 153: 'YouTube could not verify this player. Try reloading the page.' })[event.data] || 'This class cannot play here. Try another video.'),
      } });
    }).catch(failure => fail(failure.message));
    return () => {
      checkpoint(true);
      disposed = true;
      changeSource.current = null;
      window.removeEventListener('pagehide', saveOnHide);
      document.removeEventListener('visibilitychange', saveOnHide);
      window.clearInterval(poll);
      window.clearTimeout(readyTimeout);
      if (playerRef.current === player) playerRef.current = null;
      player?.destroy();
    };
    // Keep the same iframe across source/metadata updates, including fullscreen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retry]);

  return <div className="fsm-player-stage" ref={stage} style={expanded ? { height: reservedHeight } : undefined}>
    <section className={`fsm-player-shell${expanded ? ' is-expanded' : ''}`} ref={shell} aria-label="Class video player">
    <div className="fsm-player-wrap" ref={viewport}>
    <div className="fsm-player" ref={host} />
    {loading && <div className="fsm-player-status" role="status"><RefreshCw className="fsm-spin" size={24} /><span>Getting your classroom ready…</span></div>}
    {error && <div className="fsm-player-status" role="alert"><strong>Unable to play this class</strong><p>{error}</p><button type="button" onClick={() => { setError(''); setLoading(true); setRetry(value => value + 1); }}><RefreshCw size={16} /> Retry player</button></div>}
    </div>
    <div className="fsm-view-controls"><span>{expanded ? 'Your class, distraction free' : 'Fits your screen automatically'}</span><button ref={expandButton} type="button" onClick={toggleFullscreen} aria-pressed={expanded}>{expanded ? <Minimize size={18} /> : <Maximize size={18} />}{expanded ? 'Exit full screen' : 'Full screen'}</button></div>
    </section>
  </div>;
}
