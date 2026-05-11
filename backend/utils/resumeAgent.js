import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
export async function enhanceResumeWithAI({ rawText, parsedData }) {
  try {
    // const prompt = `
    //   You are an advanced resume parsing AI.

    //   INPUT:
    //   1. Raw resume text
    //   2. Parsed JSON (may be incomplete or incorrect)

    //   TASK:
    //   - Fix and improve the JSON
    //   - Extract missing:
    //     name, email, phone
    //   - Improve:
    //     skills (add missing, remove duplicates)
    //   - Extract structured:
    //     projects (title + description)
    //     experience (role, company, duration, description)
    //     achievements (title + description)
    //     hobbies

    //   RULES:
    //   - Return ONLY valid JSON
    //   - No explanation
    //   - Do not add any skill from your own suggestion.
    //   - Keep format clean and consistent
    //   - achievements must be:
    //     [{ "title": "", "description": "" }]
    //   - experience duration MUST follow this exact format:
    //     "Mon YYYY – Mon YYYY" or "Mon YYYY – Present"
    //     Examples: "Aug 2025 – Present", "Jan 2024 – Jun 2025"
    //     Never use abbreviations like "Aug'25" or just "2025".

    //   RAW TEXT:
    //   ${rawText}

    //   PARSED JSON:
    //   ${JSON.stringify(parsedData)}
    //   `;
    const prompt = `
      You are an advanced resume parsing AI.

      INPUT:
      1. Raw resume text
      2. Parsed JSON (may be incomplete or incorrect)

      TASK:
      - Fix and improve the JSON
      - Extract missing:
        name, email, phone
      - Improve:
        skills (add missing, remove duplicates)
      - Extract structured:
        projects (title + description)
        experience (role, company, duration, description)
        achievements (title + description)
        hobbies

      RULES:
      - Return ONLY valid JSON
      - No explanation
      - Do not add any skill from your own suggestion.
      - Keep format clean and consistent
      - achievements must be:
        [{ "title": "", "description": "" }]
      - experience duration MUST follow this exact format:
        "Mon YYYY – Mon YYYY" or "Mon YYYY – Present"
        Examples: "Aug 2025 – Present", "Jan 2024 – Jun 2025"
        Never use abbreviations like "Aug'25" or just "2025".

      RAW TEXT:
      ${rawText}

      PARSED JSON:
      ${JSON.stringify(parsedData)}
      `;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    let content = response.choices[0].message.content;

    content = content.replace(/```json|```/g, "").trim();

    return JSON.parse(content);

  } catch (err) {
    console.error("AI ERROR:", err.message);
    return null;
  }
}