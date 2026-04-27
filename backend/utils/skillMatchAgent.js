import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function matchSkillsWithAI({userSkills,projects,jobSkills}) {
  try {
    const prompt = `
You are an AI job matching system.

INPUT:
User Skills: ${JSON.stringify(userSkills)}
User Projects: ${JSON.stringify(projects)}
Job Required Skills: ${JSON.stringify(jobSkills)}

TASK:
1. Match user skills with job skills (consider meaning, not exact match)
2. Also infer skills from projects
3. Please check very carefully give priority to required job skills and check if user have that skill in User Skills or 
    user projects. 
4. Return:
   - matchedSkills (array)
   - missingSkills (array)
   - matchPercentage (0-100)
   - canApply (true if >= 60%)

RULES:
- Be realistic (not overly generous)
- Consider related skills (React ≈ Next.js, Node ≈ Express)
- Return ONLY JSON

FORMAT:
{
  "matchedSkills": [],
  "missingSkills": [],
  "matchPercentage": number,
  "canApply": boolean
}
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
    console.error("Skill Match AI Error:", err.message);
    return null;
  }
}