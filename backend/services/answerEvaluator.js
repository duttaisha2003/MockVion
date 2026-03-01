
import { groq } from "../config/groqClient.js";

export async function evaluateSubjectAnswer(question, userAnswer, askedTopics = []) {

const prompt = `
You are a senior technical interviewer conducting a structured ${question.category} interview.

Your responsibilities:
1. Evaluate the candidate’s answer objectively.
2. Identify meaningful conceptual gaps or misunderstandings.
3. Decide what topic should be asked next.
4. Decide whether to increase, maintain, or decrease difficulty.
5. Never repeat previously asked topics.
6. Ensure the answer is original and not copied from AI or external sources.
----------------------------------------
CURRENT QUESTION
Topic: ${question.topic}
Difficulty: ${question.difficulty}
Question: ${question.text}
Expected Keywords: ${question.expectedKeywords?.join(", ")}

ALREADY ASKED TOPICS:
${askedTopics.join(", ")}

CANDIDATE ANSWER:
${userAnswer}
----------------------------------------

SCORING (0-10):
0-2 → No understanding
3-4 → Very weak
5-6 → Partial understanding
7-8 → Good but minor gaps
9-10 → Strong and complete

----------------------------------------

GAP DETECTION RULES:

- Identify only meaningful conceptual gaps.
- Do NOT list trivial missing keywords.
- If the candidate fundamentally lacks understanding, do NOT drill the same topic again.
- If the answer shows partial understanding but misses core mechanisms, mark that as a gap.

----------------------------------------

NEXT QUESTION STRATEGY RULES:

1 If meaningful conceptual gaps are detected:
   → strategy = "gap_based"
   → nextQuestionTopic must come from identified gaps

2 If no meaningful gaps OR answer shows no understanding:
   → strategy = "next_topic"
   → select a logically progressive topic from the subject roadmap

3 Never repeat topics listed in ALREADY ASKED TOPICS.

----------------------------------------

DIFFICULTY ADJUSTMENT:

- If answer shows strong mastery → increase
- If answer shows weak understanding → decrease
- Otherwise → maintain

----------------------------------------

Return ONLY raw JSON:

{
  "score": 0,
  "feedback": "",
  "strengths": [],
  "improvements": [],
  "gapsDetected": true,
  "knowledgeGapTopics": [],
  "nextQuestionStrategy": "gap_based | next_topic",
  "nextQuestionTopic": "",
  "difficultyAdjustment": "increase | maintain | decrease"
}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const raw = completion.choices[0].message.content;

  try {
    let clean = raw.trim();

    if (clean.startsWith("```")) {
      clean = clean
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    }

    return JSON.parse(clean);

  } catch (err) {
    console.error("Invalid JSON from evaluation model:");
    console.error(raw);
    throw new Error("Evaluation model returned invalid JSON");
  }
}