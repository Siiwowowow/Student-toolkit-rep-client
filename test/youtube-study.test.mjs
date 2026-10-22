import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeLink, restoreLibrary } from '../src/Components/FocusStudyMood/youtube.mjs';

test('accepts standard, shortened, mobile, Shorts, live and embed video links', () => {
  for (const link of ['https://www.youtube.com/watch?v=AMBJ3247M0s&list=PLabcdefghijk', 'youtu.be/AMBJ3247M0s?t=30', 'https://m.youtube.com/watch?v=AMBJ3247M0s', 'youtube.com/shorts/AMBJ3247M0s', 'youtube.com/live/AMBJ3247M0s', 'https://www.youtube-nocookie.com/embed/AMBJ3247M0s']) {
    assert.deepEqual(parseYouTubeLink(link), { kind: 'video', sourceId: 'AMBJ3247M0s' });
  }
});

test('playlist mode extracts a playlist even from a video URL', () => {
  for (const link of ['youtube.com/playlist?list=PLabcdefghijk', 'https://youtube.com/watch?v=AMBJ3247M0s&list=PLabcdefghijk']) {
    assert.deepEqual(parseYouTubeLink(link, 'playlist'), { kind: 'playlist', sourceId: 'PLabcdefghijk' });
  }
});

test('rejects foreign hosts, malformed IDs and non-YouTube protocols', () => {
  for (const link of ['https://youtube.com.evil.com/watch?v=AMBJ3247M0s', 'https://evil.com/?v=AMBJ3247M0s', 'https://youtube.com/watch?v=bad', 'ftp://youtube.com/watch?v=AMBJ3247M0s', 'javascript:alert(1)', 'youtube.com/playlist?list=PLabcdefghijk']) assert.throws(() => parseYouTubeLink(link));
  assert.throws(() => parseYouTubeLink('youtube.com/watch?v=AMBJ3247M0s', 'playlist'));
});

test('restores completion and playlist order while repairing invalid selections', () => {
  const item = { id: 'playlist:PLabcdefghijk', kind: 'playlist', sourceId: 'PLabcdefghijk', videos: ['AMBJ3247M0s', 'bad', '4uM9BTDjqcl'], completed: ['AMBJ3247M0s'], title: 'Physics' };
  const restored = restoreLibrary(JSON.stringify({ entries: [item, item, null, { kind: 'video', sourceId: 'bad' }], selectedId: 'missing' }));
  assert.equal(restored.entries.length, 1);
  assert.equal(restored.selectedId, item.id);
  assert.deepEqual(restored.entries[0].videos, ['AMBJ3247M0s', '4uM9BTDjqcl']);
  assert.deepEqual(restored.entries[0].completed, ['AMBJ3247M0s']);
});

test('corrupt or unavailable storage produces an empty library', () => {
  for (const raw of [null, 'bad json', '{}', 'null', '{"entries":false}']) assert.deepEqual(restoreLibrary(raw), { entries: [], selectedId: null });
});
