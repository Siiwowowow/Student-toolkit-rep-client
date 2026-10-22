// Apply local changes using the same topic-based totals as the server.
export function applyQuizProgress(syllabus, progress, changes = []) {
  const chapters = syllabus.flatMap(subject => subject.chapters);
  const done = new Set(progress?.completedTopicKeys || []);
  if (!Array.isArray(progress?.completedTopicKeys)) {
    for (const chapter of chapters) {
      if (progress?.completedKeys?.includes(chapter.key)) {
        for (const key of chapter.topicKeys || []) done.add(key);
      }
    }
  }
  for (const change of changes) {
    const chapter = chapters.find(chapter => chapter.key === change.chapterKey);
    if (!chapter) continue;
    const keys = change.topicKey ? [change.topicKey] : chapter.topicKeys || [];
    for (const key of keys) {
      if (change.completed) done.add(key);
      else done.delete(key);
    }
  }
  const allTopics = new Set(chapters.flatMap(chapter => chapter.topicKeys || []));
  const completedTopicKeys = [...allTopics].filter(key => done.has(key));
  const completedKeys = chapters.filter(chapter => (chapter.topicKeys || []).every(key => done.has(key))).map(chapter => chapter.key);
  return {
    completedKeys, completed: completedKeys.length, total: chapters.length,
    completedTopicKeys, completedTopics: completedTopicKeys.length, totalTopics: allTopics.size,
    percentage: allTopics.size ? Math.round(completedTopicKeys.length / allTopics.size * 100) : 0,
  };
}

// Keep writes ordered per quiz while the UI immediately shows all queued changes.
// Rebase unsaved changes on every server response so earlier saves cannot undo later clicks.
export function createQuizProgressQueue({ save, onChange }) {
  const quizzes = new Map();
  const publish = entry => onChange(entry.item.id, applyQuizProgress(entry.item.syllabus, entry.confirmed, entry.pending.map(operation => operation.change)));
  async function drain(entry) {
    while (entry.pending.length) {
      const operation = entry.pending[0];
      try {
        const progress = await save(entry.item.id, operation.change);
        entry.confirmed = progress;
        entry.pending.shift();
        publish(entry);
        operation.resolve(progress);
      } catch (error) {
        entry.pending.shift();
        publish(entry);
        operation.reject(error);
      }
    }
    quizzes.delete(entry.item.id);
  }
  return (item, change) => new Promise((resolve, reject) => {
    let entry = quizzes.get(item.id);
    const start = !entry;
    if (!entry) {
      entry = { item, confirmed: item.progress, pending: [] };
      quizzes.set(item.id, entry);
    }
    entry.pending.push({ change, resolve, reject });
    publish(entry);
    if (start) void drain(entry);
  });
}
