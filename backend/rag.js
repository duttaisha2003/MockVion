
import { loadMarkdown } from "./rag/loadMarkdown.js";
import { generateSubjectQuestion } from "./services/questionGenerator.js";

async function test() {

  const subject = "java";

  console.log("Loading vectors...");
  await loadMarkdown(subject);

  console.log("Generating question...");
  const question = await generateSubjectQuestion(subject, "hooks");

  console.log("Generated Question for testing:");
  console.log(question);
}

test();