import { Groq } from "groq-sdk";

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in environment variables");
    }
    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
}

export async function generateQuestions(resumeText, interviewType = 'mixed', totalQuestions = 5) {
  try {
    const groq = getGroqClient();
   
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.5,
      presence_penalty: 0.6,
      max_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
          
          You are a technical interviewer.

          STEP 1:
          Extract ONLY the technical skills mentioned in the resume.
          Return them internally as a list called SKILLS.
          Do NOT invent skills.
          Do NOT assume skills.
          Use only what is explicitly written in the resume.

          STEP 2:
          Generate ${totalQuestions} interview questions strictly using SKILLS.

          STRICT RULES:

          1. First question MUST be:
            "Tell me about yourself" OR "Walk me through your background"

          2. Every remaining technical question MUST:
            - Be directly based on ONE skill from SKILLS
            - Clearly relate to that skill
            - Mention the skill concept directly in the question
            - Add  questions from Computer Science Core concepts From SKills Obviously like OOPS concept.

          3. Do NOT generate questions outside SKILLS.
          4. No duplicate skill usage unless totalQuestions > number of skills.
          5. Maximum 2 project-based questions.
          6. Maximum 1 behavioral question.
          7. Keep questions basic to intermediate.
          8. Rotate question starters:
            - What
            - Why
            - Explain
            - Differentiate
            - How
          9. If Experience exist in resume must ask a question . MANDATORY
          10. SO , ask about yourself, some basic core concept questions, some question from Projects, and experience(if exist).
          AVOID:
          - Advanced system design
          - Generic HR questions
          - Repeating the same skill concept twice

          Return JSON:

          {
            "questions": [
              {
                "question": "string",
                "type": "technical|behavioral|project-based",
                "difficulty": "easy|medium",
                "category": "Exact skill name from SKILLS",
                "timeLimit": number,
                "keywords": ["important", "answer", "terms"]
              }
            ]
          }`
        },
        {
          role: "user",
          content: `Resume: ${resumeText}\n\nGenerate ${totalQuestions} interview questions.`
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const parsed = JSON.parse(content);
    return parsed.questions || [];
  } catch (error) {
    console.error("Groq API Error:", error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
}

export async function evaluateAnswer(question, answer) {
  try {
    const groq = getGroqClient();
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens: 512,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an interviewer. Evaluate the candidate's answer.
          Consider: technical accuracy, completeness, clarity, and relevance.
          
          Return a valid JSON object:
          {
            "score": number (0-10),
            "feedback": "string (2-3 sentences)",
            "strengths": ["array of strengths"],
            "improvements": ["array of improvement suggestions"],
            "keywordsMatched": ["array of matched technical terms"]
          }`
        },
        {
          role: "user",
          content: `Question: ${question}\nAnswer: ${answer}\n\nEvaluate and provide feedback.`
        }
      ]
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No evaluation response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Evaluation Error:", error);
    throw new Error(`Failed to evaluate answer: ${error.message}`);
  }
}