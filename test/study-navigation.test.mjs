import test from 'node:test';
import assert from 'node:assert/strict';
import { studyNavigation, completeStudyVideo } from '../src/Components/FocusStudyMood/study-navigation.mjs';

const playlist = { id: 'playlist:p', kind: 'playlist', videos: ['a', 'b', 'c'], completed: [], done: false };
const video = { id: 'video:v', kind: 'video', sourceId: 'v', videos: [], completed: [], done: false };
test('next and previous navigate within a playlist before crossing queue items', () => {
  const items = [playlist, video];
  assert.deepEqual(studyNavigation(items, playlist.id, 0).next, { entryId: playlist.id, index: 1 });
  assert.equal(studyNavigation(items, playlist.id, 0).previous, null);
  assert.deepEqual(studyNavigation(items, playlist.id, 1).previous, { entryId: playlist.id, index: 0 });
  assert.deepEqual(studyNavigation(items, playlist.id, 2).next, { entryId: video.id, index: 0 });
  assert.deepEqual(studyNavigation(items, video.id).previous, { entryId: playlist.id, index: 2 });
  assert.equal(studyNavigation(items, video.id).next, null);
});
test('finishing a lesson is idempotent and completes the playlist only after every lesson', () => {
  const first = completeStudyVideo(playlist, 'a');
  assert.deepEqual(first.completed, ['a']);
  assert.equal(first.done, false);
  assert.deepEqual(completeStudyVideo(first, 'a').completed, ['a']);
  assert.equal(completeStudyVideo(completeStudyVideo(first, 'b'), 'c').done, true);
  assert.equal(playlist.completed.length, 0);
  assert.equal(completeStudyVideo(video, 'v').done, true);
});
test('empty queues and unloaded playlists have no current lesson', () => {
  assert.equal(studyNavigation([], 'missing').videoId, null);
  assert.equal(studyNavigation([{ ...playlist, videos: [] }], playlist.id).videoId, null);
  assert.equal(studyNavigation([playlist], playlist.id, 99).index, 2);
});
