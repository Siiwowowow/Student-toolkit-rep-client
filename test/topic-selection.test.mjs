import test from "node:test";
import assert from "node:assert/strict";
import { recordTopics, topicSummary, validTopicSelection } from "../src/Components/Student/topic-selection.mjs";

const subjects = [{ name: "Biology", chapters: [
  { name: "Cells", topics: ["Structure", "Division"] },
  { name: "Plants", topics: ["Structure"] },
] }];

test("multiple topics can span chapters and keep identical topic names distinct", () => {
  const topics = ["Cells — Structure", "Plants — Structure"];
  assert.equal(validTopicSelection(subjects, "Biology", topics), true);
  assert.equal(topicSummary(topics), "Cells — Structure · Plants — Structure");
  assert.deepEqual(recordTopics({ topics, topic: "old summary" }), topics);
});

test("legacy single-topic records edit without losing their selection", () => {
  assert.deepEqual(recordTopics({ topic: "Cells — Division" }), ["Cells — Division"]);
  assert.deepEqual(recordTopics({}), []);
  assert.equal(validTopicSelection(subjects, "Biology", recordTopics({ topic: "Cells — Division" })), true);
});

test("empty rows, duplicate selections and topics from another subject cannot save", () => {
  for (const topics of [[], [""], ["Cells — Division", ""], ["Cells — Division", "Cells — Division"], ["Forged topic"], null]) {
    assert.equal(validTopicSelection(subjects, "Biology", topics), false);
  }
  assert.equal(validTopicSelection(subjects, "Physics", ["Cells — Division"]), false);
});
