import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowDown, ArrowUp, Check, CirclePlay, Coffee, ExternalLink, Headphones, Link2, ListVideo, Play, Plus, SkipBack, SkipForward, Sparkles, Trash2, Video, X } from 'lucide-react';
import { AuthContext } from '../../Context/AuthContext';
import StudyPlayer from './StudyPlayer';
import { studyNavigation, completeStudyVideo } from './study-navigation.mjs';
import { parseYouTubeLink, restoreLibrary, videoMetadata } from './youtube.mjs';
import './FocusStudyMood.css';

function Thumbnail({ videoId }) {
  return <span className="fsm-thumbnail">{videoId ? <img src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`} alt="" loading="lazy" onError={event => { event.currentTarget.style.display = 'none'; }} /> : <ListVideo size={23} />}<span><Play size={13} fill="currentColor" /></span></span>;
}

function StudyRoom({ storageKey }) {
  const [library, setLibrary] = useState(() => { try { return restoreLibrary(localStorage.getItem(storageKey)); } catch { return restoreLibrary(null); } });
  const { entries, selectedId } = library;
  const [mode, setMode] = useState('video');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [metadata, setMetadata] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);
  const [autoNext, setAutoNext] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [playbackMessage, setPlaybackMessage] = useState('');
  const [clearConfirm, setClearConfirm] = useState(false);
  const playerRef = useRef(null);
  const classroomRef = useRef(null);
  const revealFirstClass = useRef(false);
  const metadataCache = useRef(new Set());
  const selected = entries.find(item => item.id === selectedId);
  const completed = entries.reduce((total, item) => total + (item.kind === 'video' ? Number(item.done) : item.videos.filter(id => item.completed.includes(id)).length), 0);
  const totalClasses = entries.reduce((total, item) => total + (item.kind === 'video' ? 1 : item.videos.length), 0);
  const metadataIds = [...new Set(entries.flatMap(item => item.kind === 'video' ? [item.sourceId] : item.videos))].join(',');

  useEffect(() => {
    document.documentElement.classList.add('focus-study-scroll');
    return () => document.documentElement.classList.remove('focus-study-scroll');
  }, []);

  useEffect(() => {
    if (!selectedId || !revealFirstClass.current) return;
    revealFirstClass.current = false;
    const frame = window.requestAnimationFrame(() => {
      if (!window.matchMedia('(max-width: 700px)').matches) return;
      classroomRef.current?.focus({ preventScroll: true });
      classroomRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedId]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(library)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [library, storageKey]);

  useEffect(() => {
    const controller = new AbortController();
    const cache = metadataCache.current;
    const ids = metadataIds.split(',').filter(id => id && !cache.has(id));
    const pending = new Set();
    let cursor = 0;
    const worker = async () => {
      while (cursor < ids.length && !controller.signal.aborted) {
        const id = ids[cursor++];
        cache.add(id);
        pending.add(id);
        try {
          const info = await videoMetadata(id, AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]));
          if (!controller.signal.aborted) setMetadata(current => ({ ...current, [id]: info }));
        } catch { /* Keep the thumbnail and fallback title when metadata is unavailable. */ }
        finally { pending.delete(id); }
      }
    };
    void Promise.all([worker(), worker(), worker()]);
    return () => {
      for (const id of pending) cache.delete(id);
      controller.abort();
    };
  }, [metadataIds]);

  const updateEntry = (id, update) => setLibrary(current => ({ ...current, entries: current.entries.map(item => {
    if (item.id !== id) return item;
    const next = update(item);
    if (next.kind === 'playlist') next.done = next.videos.length > 0 && next.videos.every(videoId => next.completed.includes(videoId));
    return next;
  }) }));
  const select = (item, play = true, index = 0) => {
    setAutoplay(play);
    setPlaybackMessage('');
    setStartIndex(index);
    if (item.id !== selectedId) { setActiveVideo(null); setPlayerReady(false); }
    setLibrary(current => ({ ...current, selectedId: item.id }));
    if (item.id === selectedId && play) {
      if (item.kind === 'playlist') playerRef.current?.playVideoAt(index);
      else playerRef.current?.playVideo();
    }
  };
  const add = event => {
    event.preventDefault();
    try {
      const source = parseYouTubeLink(url, mode);
      const id = `${source.kind}:${source.sourceId}`;
      if (entries.some(item => item.id === id)) throw new Error('This is already in your queue.');
      if (entries.length >= 200) throw new Error('Your queue is full. Remove an item before adding another.');
      const item = { ...source, id, title: title.trim(), done: false, videos: [], completed: [] };
      if (!selectedId) { revealFirstClass.current = true; setStartIndex(0); setActiveVideo(null); setPlayerReady(false); setPlaybackMessage(''); }
      setLibrary(current => ({ entries: [...current.entries, item], selectedId: current.selectedId || id }));
      setUrl(''); setTitle(''); setMessage('Added to your focus queue.');
    } catch (error) { setMessage(error.message); }
  };
  const remove = id => {
    if (id === selectedId) { setStartIndex(0); setActiveVideo(null); setPlayerReady(false); setPlaybackMessage(''); }
    setLibrary(current => {
      const index = current.entries.findIndex(item => item.id === id);
      const next = current.entries.filter(item => item.id !== id);
      return { entries: next, selectedId: current.selectedId === id ? next[Math.min(index, next.length - 1)]?.id || null : current.selectedId };
    });
  };
  const move = (id, direction) => setLibrary(current => {
    const next = [...current.entries];
    const index = next.findIndex(item => item.id === id);
    if (index + direction < 0 || index + direction >= next.length) return current;
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    return { ...current, entries: next };
  });
  const nextEntry = entries[entries.findIndex(item => item.id === selectedId) + 1];
  const navigation = studyNavigation(entries, selectedId, activeVideo?.index || 0);
  const currentCompleted = selected?.kind === 'video' ? selected.done : selected?.completed.includes(navigation.videoId);
  const goTo = target => {
    const item = entries.find(entry => entry.id === target.entryId);
    if (item) select(item, true, target.index);
  };
  const nextLesson = () => {
    if (!playerReady || !navigation.videoId) return;
    updateEntry(selected.id, item => completeStudyVideo(item, navigation.videoId));
    if (navigation.next) goTo(navigation.next);
    else {
      playerRef.current?.pauseVideo();
      setPlaybackMessage(selected.kind === 'playlist' ? 'Last lesson completed. You can revisit any class below.' : 'Class completed. Add another class whenever you are ready.');
    }
  };
  const displayTitle = item => item.title || (item.kind === 'video' ? metadata[item.sourceId]?.title : null) || (item.kind === 'playlist' ? 'YouTube playlist' : `YouTube class · ${item.sourceId}`);
  const currentTitle = selected ? activeVideo?.title || displayTitle(selected) : null;


  return <main className="fsm-page study-tool-page">
    <div className="fsm-shell">
      <header className="fsm-heading">
        <div className="fsm-hero-copy">
          <span className="fsm-eyebrow"><Sparkles size={14} /> YOUR PERSONAL LEARNING SPACE</span>
          <div className="fsm-title"><Link className="fsm-logo" to="/" aria-label="Focus Study Mood brand — Home"><Headphones size={27} /></Link><h1>Focus Study <span>Mood.</span></h1></div>
          <p>Less distraction. More understanding.<br className="fsm-mobile-break" /> Make every class count.</p>
          <div className="fsm-heading-status"><span><i /> Ready when you are</span><span><ListVideo size={15} /> Videos & playlists, all in one place</span></div>
        </div>
        <div className="fsm-hero-art" aria-hidden="true"><span className="fsm-art-orbit" /><span className="fsm-art-headphones"><Headphones size={62} strokeWidth={1.5} /></span><span className="fsm-art-play"><Play size={19} fill="currentColor" /></span><span className="fsm-art-caption"><i /> A little focus goes a long way.</span></div>
      </header>
      <section className="fsm-stats" aria-label="Your study room at a glance">
        <div className="fsm-stat"><span className="fsm-stat-icon"><ListVideo size={21} /></span><div><span>YOUR CLASS LIBRARY</span><strong>{totalClasses} <small>{totalClasses === 1 ? 'class ready' : 'classes ready'}</small></strong></div><span className="fsm-stat-note">{entries.filter(item => item.kind === 'playlist').length} playlists</span></div>
        <div className="fsm-stat"><span className="fsm-stat-icon"><Check size={21} /></span><div><span>ONE STEP CLOSER</span><strong>{completed} <small>completed</small></strong></div><span className="fsm-stat-note">Keep going!</span></div>
      </section>
      <div className={`fsm-grid${entries.length ? '' : ' is-empty'}`}>
        <aside className="fsm-add-column">
          <section className="fsm-card fsm-add"><div className="fsm-section-title"><div><h2>Add your classes</h2><p>A little preparation, a lot more focus.</p></div><Link2 size={19} /></div>
            <div className="fsm-tabs" role="group" aria-label="YouTube link type"><button type="button" aria-pressed={mode === 'video'} className={mode === 'video' ? 'is-active' : ''} onClick={() => { setMode('video'); setMessage(''); }}><Video size={15} /> Video</button><button type="button" aria-pressed={mode === 'playlist'} className={mode === 'playlist' ? 'is-active' : ''} onClick={() => { setMode('playlist'); setMessage(''); }}><ListVideo size={15} /> Playlist</button></div>
            <form onSubmit={add}><label htmlFor="fsm-url">YouTube {mode} link</label><textarea id="fsm-url" value={url} onChange={event => setUrl(event.target.value)} placeholder={mode === 'playlist' ? 'youtube.com/playlist?list=…' : 'Paste a YouTube video link…'} required rows={3} /><label htmlFor="fsm-title">Class title <small>(optional)</small></label><input id="fsm-title" value={title} maxLength={160} onChange={event => setTitle(event.target.value)} placeholder="We’ll find the title for you" /><button className="fsm-primary" type="submit"><Plus size={17} /> Add {mode === 'playlist' ? 'playlist' : 'to queue'}</button></form>
            {message && <p className="fsm-message" role="status">{message}</p>}
            <div className="fsm-tip"><span><Check size={15} /></span><p>Video titles and thumbnails appear automatically. Public playlists load their class list in the player.</p></div>
          </section>
          <section className="fsm-note"><Coffee size={21} /><h3>Make room for deep work.</h3><p>Put your phone aside, grab some water, and take it one class at a time.</p><Link to="/focus-mode">Open your study goal timer <ExternalLink size={13} /></Link></section>
        </aside>

          <section className="fsm-card fsm-classroom" ref={classroomRef} tabIndex={-1} aria-label="Your classroom"><div className="fsm-now"><span><i /> {selected ? 'NOW IN YOUR CLASSROOM' : 'YOUR CLASSROOM'}</span><span>YOUTUBE</span></div>
            {selected ? <StudyPlayer entry={selected} playerRef={playerRef} autoplay={autoplay} startIndex={startIndex} onReadyChange={setPlayerReady} onActive={(videoId, index, videoTitle) => { setActiveVideo({ videoId, index, title: videoTitle }); if (videoTitle) setMetadata(current => ({ ...current, [videoId]: { ...current[videoId], title: videoTitle } })); }} onPlaylist={videos => updateEntry(selected.id, item => ({ ...item, videos }))} onComplete={videoId => updateEntry(selected.id, item => completeStudyVideo(item, videoId))} onNext={() => { if (autoNext && nextEntry) select(nextEntry); }} /> : <div className="fsm-empty-player"><span><CirclePlay size={43} strokeWidth={1.3} /></span><h2>A space for your next big idea.</h2><p>Add a YouTube class or playlist to begin.<br />Your lesson will play right here.</p><span className="fsm-empty-pill"><Headphones size={14} /> Settle in. Let’s learn something.</span></div>}
            <div className="fsm-class-details"><div><h2>{currentTitle || 'Your focus starts here'}</h2><p>{selected ? activeVideo && metadata[activeVideo.videoId]?.author || 'Use the player settings for available quality, playback speed, and captions.' : 'Free classes, lined up and ready when you are.'}</p></div></div>
            <div className="fsm-lesson-navigation" aria-label="Class navigation">
              <button type="button" disabled={!playerReady || !navigation.previous} onClick={() => goTo(navigation.previous)}><SkipBack size={18} /> Previous</button>
              <span>{selected?.kind === 'playlist' && selected.videos.length ? 'Lesson ' + (navigation.index + 1) + ' of ' + selected.videos.length : selected ? 'Your current class' : 'Add a class to begin'}</span>
              <button type="button" className="fsm-next-lesson" disabled={!playerReady || !navigation.videoId || (!navigation.next && currentCompleted)} onClick={nextLesson}>{navigation.next ? 'Next' : 'Finish'} <SkipForward size={18} /></button>
            </div>
            {playbackMessage && <p className="fsm-playback-message" role="status">{playbackMessage}</p>}
            <div className="fsm-player-footnote">Stay in your study space · Playback uses YouTube’s embedded player.</div>
          </section>


        <aside className="fsm-card fsm-queue"><div className="fsm-section-title"><div><h2>Focus queue <span>{entries.length}</span></h2><p>Your next steps, in order.</p></div><button type="button" className="fsm-icon-button" disabled={!entries.length} aria-label="Clear queue" onClick={() => setClearConfirm(true)}><Trash2 size={16} /></button></div>
          {clearConfirm && <div className="fsm-confirm" role="alert"><p>Remove all classes and saved completion marks?</p><button type="button" onClick={() => { setLibrary({ entries: [], selectedId: null }); setClearConfirm(false); }}>Clear all</button><button type="button" onClick={() => setClearConfirm(false)}>Keep classes</button></div>}
          <div className="fsm-progress"><div><span>{completed} completed</span><span>{totalClasses ? `${totalClasses} classes` : 'Build your study list'}</span></div><div><i style={{ width: `${totalClasses ? Math.min(100, completed / totalClasses * 100) : 0}%` }} /></div></div>
          {!entries.length && <div className="fsm-queue-empty"><ListVideo size={32} strokeWidth={1.3} /><h3>A clear queue. A fresh start.</h3><p>Add your first class using a video or playlist link.</p></div>}
          <ol className="fsm-queue-list">{entries.map((item, index) => <li key={item.id} className={`fsm-queue-item${item.id === selectedId ? ' is-selected' : ''}${item.done ? ' is-done' : ''}${item.kind === 'playlist' ? ' is-playlist' : ''}`}><div className="fsm-queue-item-main"><span className="fsm-order">{String(index + 1).padStart(2, '0')}</span><button type="button" className="fsm-class-button" onClick={() => select(item)} aria-label={`Play ${displayTitle(item)}`} aria-current={item.id === selectedId ? 'true' : undefined}><Thumbnail videoId={item.kind === 'video' ? item.sourceId : item.videos[0]} /><span>{item.kind === 'playlist' && <span className="fsm-playlist-label"><ListVideo size={13} /> Main playlist</span>}<strong>{displayTitle(item)}</strong><small>{item.kind === 'playlist' ? `${item.videos.length || 'Load'} classes · Playlist` : item.done ? 'Completed' : item.id === selectedId ? 'In your classroom' : 'Ready to watch'}</small></span></button></div>
            <div className="fsm-item-actions"><button type="button" disabled={!index} onClick={() => move(item.id, -1)} aria-label={`Move ${displayTitle(item)} up`}><ArrowUp size={13} /></button><button type="button" disabled={index === entries.length - 1} onClick={() => move(item.id, 1)} aria-label={`Move ${displayTitle(item)} down`}><ArrowDown size={13} /></button><span /><button type="button" className={item.done ? 'is-complete' : ''} aria-pressed={item.done} aria-label={`Mark ${displayTitle(item)} ${item.done ? 'incomplete' : 'complete'}`} onClick={() => updateEntry(item.id, current => ({ ...current, done: !current.done, completed: current.done ? [] : current.kind === 'playlist' ? [...current.videos] : current.completed }))}><Check size={14} /></button><button type="button" onClick={() => remove(item.id)} aria-label={`Remove ${displayTitle(item)}`}><X size={14} /></button></div>
            {item.kind === 'playlist' && item.id === selectedId && <div className="fsm-playlist-classes">{item.videos.length ? item.videos.map((videoId, videoIndex) => <div className={(activeVideo?.index === videoIndex ? 'is-active' : '') + (item.completed.includes(videoId) ? ' is-completed' : '')} key={`${videoId}:${videoIndex}`}><button type="button" disabled={!playerReady} onClick={() => { setPlaybackMessage(''); playerRef.current?.playVideoAt(videoIndex); }}><Thumbnail videoId={videoId} /><span><strong>{metadata[videoId]?.title || `Class ${videoIndex + 1}`}</strong><small>Lesson {videoIndex + 1}{item.completed.includes(videoId) ? ' | Completed' : ''}</small></span></button><button type="button" aria-label={`Toggle completion for lesson ${videoIndex + 1}`} aria-pressed={item.completed.includes(videoId)} onClick={() => updateEntry(item.id, current => ({ ...current, completed: current.completed.includes(videoId) ? current.completed.filter(id => id !== videoId) : [...current.completed, videoId] }))}><Check size={13} /></button></div>) : <p>Press play to load this public playlist’s classes. Private or unavailable playlists cannot be loaded.</p>}</div>}
          </li>)}</ol>
          <label className="fsm-autoplay"><span><SkipForward size={16} /> Auto-play next queue item</span><input type="checkbox" checked={autoNext} onChange={event => setAutoNext(event.target.checked)} /></label><p className="fsm-saved">Your queue and completion marks are saved in this browser.</p>
          {storageError && <p className="fsm-message" role="alert">Browser storage is unavailable. Keep this page open to retain your queue.</p>}
        </aside>

      </div>
      <footer className="fsm-footer"><Headphones size={14} /> Less switching. More understanding. <span>You’ve got this.</span></footer>
    </div>
  </main>;
}

export default function FocusStudyMood() {
  const { user } = useContext(AuthContext);
  const storageKey = `toolkit-study-mood-v1:${user.uid}`;
  return <StudyRoom key={storageKey} storageKey={storageKey} />;
}
