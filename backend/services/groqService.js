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
      temperature: 0.3,
      max_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a senior technical interviewer.
          Generate ${totalQuestions} interview questions based on the resume.
          Consider interview type: ${interviewType}
          **IMPORTANT RULES:**
          1. ALWAYS start with "Tell me about yourself" or "Walk me through your background" as the FIRST question
          2. For technical questions, focus on the candidate's ACTUAL skills from their resume
          3. Create questions that test DEEP understanding, not just definitions
          4. Ensure questions are DIVERSE - no two similar questions
          
          **QUESTION GENERATION GUIDELINES:**
          
          For SKILLS-BASED questions (if resume shows JavaScript/React/Node.js etc.):
          - Ask "why" and "how" questions, not just "what" questions
          - Example: Instead of "What is async/await?", ask "Why would you use async/await over promises? Can you explain a scenario where async/await made your code more maintainable?"
          - Ask about real-world problem-solving with their skills
          - Include scenario-based questions that combine multiple skills
          
          For PROJECT-BASED questions:
          - Reference specific projects mentioned in the resume
          - Ask about challenges faced and how they overcame them
          - Ask about architectural decisions and trade-offs
          
          For BEHAVIORAL questions:
          - Make them relevant to the technical context
          - Ask about teamwork, conflict resolution, learning experiences
          
          For SITUATIONAL questions:
          - Create realistic scenarios based on their tech stack
          - Present a problem and ask how they'd solve it
          
          **DISTRIBUTION RULES:**
          - First question: ALWAYS introductory ("Tell me about yourself" or similar)
          - Remaining questions: Mix based on interviewType parameter
          - For technical questions: Always tie to specific skills in their resume
          - No duplicate topics or similar question patterns
          Return a valid JSON object with format:
          {
            "questions": [
              {
                "question": "string(must add a question related to project from resume)
                no duplicate or same type question in different interview. ask question related to skills.  ",
                "type": "technical|behavioral|situational|project-based",
                "difficulty": "easy|medium|hard",
                "category": "string (e.g., JavaScript, React, java - fetched from skills of the resume )",
                "timeLimit": number (seconds),
                "keywords": ["array", "of", "expected", "keywords"]
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