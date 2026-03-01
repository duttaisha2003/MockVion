
import { retrieveSubjectChunks } from "../rag/retrieve.js";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateSubjectQuestion(subject, topic = null,difficulty) {
    const searchQuery = topic
  ? `${subject} ${topic} concepts`
  : `${subject} core fundamentals ${difficulty}`;
  const context = await retrieveSubjectChunks(subject, searchQuery);
 const prompt = `
You are a senior ${subject} technical interviewer.

Your task:
Generate ONE high-quality technical interview question.

CONSTRAINTS:
- Subject: ${subject}
- Focus Topic: ${topic}
- Difficulty: ${difficulty}
- do not generate so much descriptive question.
- The question must strictly stay within the subject.
- Do NOT change programming language.
- Do NOT include explanation or answer.
- Return raw JSON only.
- Do NOT use markdown.
- Start with { and end with }.

Knowledge Context:
${context}

Return JSON in this exact format:

{
  "text": "",
  "difficulty": "${difficulty}",
  "type": "technical",
  "topic": "${topic}",
  "category": "${subject}",
  "expectedKeywords": []
}
`; 

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const raw = completion.choices[0].message.content;

  try {
    let clean = raw.trim();

    // Remove markdown code blocks if model ignores instruction
    if (clean.startsWith("```")) {
      clean = clean
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
    }

    return JSON.parse(clean);

  } catch (err) {
    console.error("❌ Invalid JSON from LLM:");
    console.error(raw);
    throw new Error("LLM returned invalid JSON format");
  }
}