import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlaybackProgress } from '../src/Components/FocusStudyMood/playback-progress.mjs';
import { isTemporaryAccessFailure } from '../src/Context/access-recovery.mjs';

const video = { id: 'video:AMBJ3247M0s', kind: 'video', sourceId: 'AMBJ3247M0s' };
const playlist = { id: 'playlist:PLabcdefghijk', kind: 'playlist', sourceId: 'PLabcdefghijk', videos: ['AMBJ3247M0s', '4uM9BTDjqcl'] };
const storage = () => { const data = new Map(); return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) }; };

test('video and each playlist lesson resume independently after a new page load', () => {
  const disk = storage();
  const store = createPlaybackProgress(disk, 'user-a');
  store.save(video, video.sourceId, 0, 123.5);
  store.save(playlist, playlist.videos[0], 0, 25);
  store.save(playlist, playlist.videos[1], 1, 456);
  const restored = createPlaybackProgress(disk, 'user-a');
  assert.equal(restored.resume(video).seconds, 123.5);
  assert.deepEqual(restored.resume(playlist), { index: 1, videoId: playlist.videos[1], seconds: 456 });
  assert.equal(restored.resume(playlist, 0).seconds, 25);
  assert.equal(createPlaybackProgress(disk, 'user-b').resume(video).seconds, 0);
});

test('reordered playlists follow the saved video, explicit navigation follows the requested lesson', () => {
  const store = createPlaybackProgress(storage(), 'user');
  store.save(playlist, playlist.videos[1], 1, 90);
  const reordered = { ...playlist, videos: [...playlist.videos].reverse() };
  assert.equal(store.resume(reordered).index, 0);
  assert.equal(store.resume(reordered, 1).seconds, 0);
  assert.equal(store.resume({ ...playlist, videos: [] }).index, 1);
});

test('completed videos restart, invalid readings do not erase the last checkpoint', () => {
  const store = createPlaybackProgress(storage(), 'user');
  store.save(video, video.sourceId, 0, 50);
  store.save(video, video.sourceId, 0, NaN);
  store.save(video, '4uM9BTDjqcl', 0, 99);
  assert.equal(store.resume(video).seconds, 50);
  store.save(video, video.sourceId, 0, 100, true);
  assert.equal(store.resume(video).seconds, 0);
});

test('blocked storage retains an in-memory checkpoint and reports the failure', () => {
  let failures = 0;
  const store = createPlaybackProgress({ getItem() { throw Error(); }, setItem() { throw Error(); } }, 'user', () => failures++);
  store.save(video, video.sourceId, 0, 80);
  assert.equal(store.resume(video).seconds, 80);
  assert.equal(failures, 1);
});

test('access recovery distinguishes outages from denied or invalid accounts', () => {
  for (const status of [408, 429, 500, 502, 503, 504]) assert.equal(isTemporaryAccessFailure({ status }), true);
  for (const status of [400, 401, 403, 404, 200]) assert.equal(isTemporaryAccessFailure({ status }), false);
  assert.equal(isTemporaryAccessFailure(new TypeError('Failed to fetch')), true);
  assert.equal(isTemporaryAccessFailure({ name: 'AbortError' }), true);
});
