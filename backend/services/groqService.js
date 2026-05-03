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

export async function generateJobQuestionsFromAI(
  jobText,
  interviewType = "technical",
  totalQuestions = 10
) {
  try {
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.6,
      top_p: 0.9,
      max_tokens: 2048,
      response_format: { type: "json_object" },

      messages: [
        {
          role: "system",
          content: `
You are a senior technical interviewer.

Your task:
Generate ${totalQuestions} high-quality interview questions.

STEP 1:
Extract ONLY the required skills from the JOB DESCRIPTION.
Store them internally as SKILLS.

STRICT RULES:

- Each question MUST be based on ONE skill from SKILLS
- Do NOT assume or add extra skills
- Do NOT go outside job description
- Keep questions short and clear (no long descriptions)
- Focus on basic to intermediate level
- Do NOT include answers or explanations
- Do NOT repeat same concept
- Max 1 behavioral question
- Avoid system design questions

QUESTION STYLE:
- Use variety: What, Why, How, Explain, Difference
- Include real-world usage where possible

SPECIAL RULE:
- First question MUST be:
  "Tell me about yourself"

OUTPUT FORMAT (STRICT JSON ONLY):
- No markdown
- No extra text
- Must start with { and end with }

{
  "questions": [
    {
      "text": "",
      "difficulty": "easy|medium",
      "type": "technical|behavioral",
      "topic": "specific skill",
      "category": "skill name",
      "expectedKeywords": []
    }
  ]
}
`
        },
        {
          role: "user",
          content: `
JOB DESCRIPTION:
${jobText}

Generate ${totalQuestions} questions.
`
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
    console.error("Groq Job Qs Error:", error);
    throw new Error(`Failed to generate job questions: ${error.message}`);
  }
}

export async function evaluateAnswer(question, answer) {
  //  skip API call for empty answers
  if (!answer?.trim() || answer.trim().length < 5) {
    return {
      score: 0,
      feedback: "No answer provided.",
      strengths: [],
      improvements: ["Please provide a substantive answer."],
      keywordsMatched: [],
    };
  }

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
          content: `You are a strict technical interviewer evaluating a candidate.
          
          Consider: technical accuracy, completeness, clarity, and relevance.
          SCORING RUBRIC (score 0-10):
          0-1 : No answer, completely wrong, or irrelevant
          2-4  : Mentions the topic but is mostly incorrect or dangerously incomplete
          5-6  : Partially correct — core idea present but missing key details or has errors
          7-8  : Correct and reasonably complete, minor gaps or imprecision
          9-10 : Accurate, complete, well-structured, uses precise terminology

          RULES:
            - Penalize factually incorrect statements (e.g. claiming operator overloading exists in Java)
            - Do NOT reward vague answers ("it helps with errors") with scores above 5
            - Differentiate: a better answer must receive a meaningfully higher score
            - Be consistent: two similar-quality answers must score within 1 point of each other

          Return ONLY a valid JSON object, no markdown, no extra text:
          {
            "score": <integer 0–10>,
            "feedback": "<2–3 precise sentences citing specific gaps or strengths>",
            "strengths": ["<specific strength>"],
            "improvements": ["<specific, actionable suggestion>"],
            "keywordsMatched": ["<technical terms correctly used>"]
          }`,
        },
        {
          role: "user",
          content: `Question: ${question}\nAnswer: ${answer}\n\nEvaluate and provide feedback.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("No evaluation response");

    //salvage JSON if model wraps it in markdown
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Model returned non-JSON response");
      parsed = JSON.parse(match[0]);
    }

    // Validate score is actually a number in range
    const score = Number(parsed.score);
    if (isNaN(score) || score < 0 || score > 10) {
      throw new Error(`Invalid score received: ${parsed.score}`);
    }

    return {
      ...parsed,
      score: Math.round(score), 
    };

  } catch (error) {
    console.error("Evaluation Error:", error);
    throw new Error(`Failed to evaluate answer: ${error.message}`);
  }
}