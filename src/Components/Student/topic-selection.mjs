export const MAX_TOPICS = 100;

export function recordTopics(record) {
  return Array.isArray(record?.topics) ? record.topics : record?.topic ? [record.topic] : [];
}

export function topicSummary(topics) {
  return topics.filter((topic) => typeof topic === "string" && topic.trim()).join(" · ");
}

export function validTopicSelection(subjects, subjectName, topics) {
  const subject = subjects.find((item) => item.name === subjectName);
  if (!subject || !Array.isArray(topics) || !topics.length || topics.length > MAX_TOPICS || new Set(topics).size !== topics.length) return false;
  const allowed = new Set(subject.chapters.flatMap((chapter) => chapter.topics.map((topic) => `${chapter.name} — ${topic}`)));
  return topics.every((topic) => allowed.has(topic));
}
