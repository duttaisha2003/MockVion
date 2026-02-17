
export function parseResumeText(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+91[\s-]?)?[6-9]\d{9}/;
  const nameRegex = /^[A-Z][A-Za-z\s]{2,40}/m;

  function extractSection(sectionName) {
    const regex = new RegExp(
      `${sectionName}\\s*(.*?)\\s*(?=\\n[A-Z ]+|$)`,
      "gs"
    );
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  }
  function extractName(text) {
  const firstLine = text.split("\n")[0] || "";

  return firstLine
    .replace(/email.*$/i, "")     
    .replace(/mobile.*$/i, "")    
    .replace(/phone.*$/i, "")     
    .replace(/[^A-Za-z\s]/g, "") 
    .replace(/\s+/g, " ")        
    .trim();
  }

  const skills = extractSkills(text);
  const projectsRaw = extractSection("PROJECTS");
  const achievements = extractSection("ACHIEVEMENTS");
  const hobbies = extractSection("HOBBIES");
  const experience = extractSection("EXPERIENCE");

  return {
    name: extractName(text),
    email: text.match(emailRegex)?.[0] || "",
    phone: text.match(phoneRegex)?.[0] || "",
    skills,
    projects: projectsRaw.map(p => ({
      title: p.split("\n")[0] || "",
      description: p
    })),
    achievements,
    hobbies,
    experience: experience.map(e => ({
      role: "",
      company: "",
      duration: "",
      description: e
    })),
    rawText: text
  };
}

function extractSkills(text) {
  const skillsDB = [
    // Frontend
    "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular",
    "HTML", "CSS", "Tailwind", "Bootstrap", "Redux", "Vite",

    // Backend
    "Node", "Express", "NestJS", "Spring Boot", "Django", "Flask",

    // Databases
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase",

    // Tools
    "Git", "GitHub", "Postman", "Docker",

    // Languages
    "Python", "Java", "C", "C++"
  ];

  return skillsDB.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
}

