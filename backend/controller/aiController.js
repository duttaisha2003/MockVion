import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const generateJobTemplate = async (req, res) => {
  try {
   // console.log("called")
    const { title ,level} = req.body;
  //  console.log("called2",title)
    if (!title) {
      return res.status(400).json({
        message: "Job title is required"
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
  {
    role: "system",
    content: `
You are an expert technical recruiter and hiring manager.

Your job is to generate HIGH-QUALITY, INDUSTRY-RELEVANT job descriptions and skills.

Rules:
- Skills must be specific, modern, and valuable in real hiring
- Avoid generic skills like "hardworking", "communication"
- Prefer tools, frameworks, technologies, and concepts
- Include both core and supporting skills
- Skills should match current industry demand (2024–2025)
- No duplicates
- Keep skills concise (1–3 words each)
- Do NOT explain skills.
- No wrong skill (Example- mongoDB for frontend Development)
- Output must be STRICT JSON only
`
  },
  {
    role: "user",
    content: `
Generate a professional job description and required skills for:

ROLE: ${title}
EXPERIENCE LEVEL: ${level}

Requirements:
- Description: 4–5 lines, clear and professional maintain EXPERIENCE LEVEl
- Skills:  highly relevant known technical skills  No wrong skill (Example- mongoDB for frontend Development)
- Include a mix of:
  • Core technologies
  • Frameworks
  • Databases
  • Tools
  • Concepts (if important)

Return ONLY JSON in this format:

{
  "description": "string",
  "skills": ["skill1", "skill2", "skill3"]
}
`
  }
],
      temperature: 0.4
    });
    // console.log("called2")
    const aiResponse = completion.choices[0].message.content;

    const cleaned = aiResponse.replace(/```json|```/g, "").trim();

    const data = JSON.parse(cleaned);
   // console.log(data)
    res.json(data);

  } catch (error) {

    res.status(500).json({
      message: "AI generation failed",
      error: error.message
    });

  }
};