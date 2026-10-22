import test from 'node:test';
import assert from 'node:assert/strict';
import { applyQuizProgress, createQuizProgressQueue } from '../src/Components/Student/quiz-progress.mjs';

const syllabus = [{ subject: 'Physics', chapters: [
  { key: 'motion', topics: ['Speed', 'Acceleration'], topicKeys: ['speed', 'acceleration'] },
  { key: 'energy', topics: ['Work'], topicKeys: ['work'] },
] }];
const change = (chapterKey, completed, topicKey) => ({ chapterKey, completed, topicKey });
const empty = applyQuizProgress(syllabus);
const item = { id: 'quiz', syllabus, progress: empty };
const flush = () => new Promise(resolve => setImmediate(resolve));

test('topic completion updates weighted progress and whole chapter status immediately', () => {
  const one = applyQuizProgress(syllabus, empty, [change('motion', true, 'speed')]);
  assert.equal(one.percentage, 33);
  assert.equal(one.completed, 0);
  const all = applyQuizProgress(syllabus, one, [change('motion', true)]);
  assert.equal(all.percentage, 67);
  assert.deepEqual(all.completedKeys, ['motion']);
  const undone = applyQuizProgress(syllabus, all, [change('motion', false, 'speed')]);
  assert.equal(undone.completed, 0);
  assert.deepEqual(undone.completedTopicKeys, ['acceleration']);
});

test('legacy chapter completion expands to topics; unknown saved topics are excluded', () => {
  assert.equal(applyQuizProgress(syllabus, { completedKeys: ['motion'] }).completedTopics, 2);
  assert.equal(applyQuizProgress(syllabus, { completedTopicKeys: ['obsolete', 'work'] }).completedTopics, 1);
});

test('rapid changes stay visible through older responses and persist in click order', async () => {
  const requests = [], views = [];
  let server = empty;
  const enqueue = createQuizProgressQueue({
    save: (id, operation) => new Promise(resolve => requests.push({ id, operation, resolve })),
    onChange: (id, progress) => views.push(progress),
  });
  const operations = [change('motion', true), change('motion', false, 'speed'), change('motion', true, 'speed'), change('energy', true, 'work')];
  const saves = operations.map(operation => enqueue(item, operation));
  assert.equal(requests.length, 1);
  assert.equal(views.at(-1).percentage, 100);
  for (let index = 0; index < operations.length; index++) {
    assert.deepEqual(requests[index].operation, operations[index]);
    server = applyQuizProgress(syllabus, server, [requests[index].operation]);
    requests[index].resolve(server);
    await flush();
    assert.equal(views.at(-1).percentage, 100, 'an older save must not erase later pending changes');
  }
  await Promise.all(saves);
  assert.deepEqual(views.at(-1), server);
});

test('failed change rolls back while unrelated queued changes still save', async () => {
  const requests = [], views = [];
  const enqueue = createQuizProgressQueue({
    save: (id, operation) => new Promise((resolve, reject) => requests.push({ operation, resolve, reject })),
    onChange: (id, progress) => views.push(progress),
  });
  const failed = assert.rejects(enqueue(item, change('motion', true, 'speed')), /Offline/);
  const succeeds = enqueue(item, change('energy', true));
  requests[0].reject(new Error('Offline'));
  await flush();
  assert.deepEqual(views.at(-1).completedTopicKeys, ['work']);
  requests[1].resolve(applyQuizProgress(syllabus, empty, [change('energy', true)]));
  await Promise.all([failed, succeeds]);
  assert.equal(views.at(-1).completedTopics, 1);
});

test('different quizzes save independently; repeated same-topic toggles keep the final intent', async () => {
  const requests = [], views = new Map();
  const enqueue = createQuizProgressQueue({
    save: (id, operation) => new Promise(resolve => requests.push({ id, operation, resolve })),
    onChange: (id, progress) => views.set(id, progress),
  });
  const saves = [enqueue(item, change('motion', true, 'speed')), enqueue(item, change('motion', false, 'speed')), enqueue({ ...item, id: 'other' }, change('energy', true))];
  assert.equal(requests.length, 2);
  assert.equal(views.get('quiz').completedTopics, 0);
  assert.equal(views.get('other').completedTopics, 1);
  requests[1].resolve(applyQuizProgress(syllabus, empty, [requests[1].operation]));
  requests[0].resolve(applyQuizProgress(syllabus, empty, [requests[0].operation]));
  await flush();
  assert.equal(views.get('quiz').completedTopics, 0);
  requests[2].resolve(empty);
  await Promise.all(saves);
  assert.equal(views.get('quiz').completedTopics, 0);
});
