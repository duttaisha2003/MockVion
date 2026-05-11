
// export function parseResumeText(text) {
//   const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
//   const phoneRegex = /(\+91[\s-]?)?[6-9]\d{9}/;
//   const nameRegex = /^[A-Z][A-Za-z\s]{2,40}/m;

//   function extractSection(sectionName) {
//     const regex = new RegExp(
//       `${sectionName}\\s*(.*?)\\s*(?=\\n[A-Z ]+|$)`,
//       "gs"
//     );
//     const matches = [];
//     let match;
//     while ((match = regex.exec(text)) !== null) {
//       matches.push(match[1].trim());
//     }
//     return matches;
//   }
//   function extractName(text) {
//   const firstLine = text.split("\n")[0] || "";

//   return firstLine
//     .replace(/email.*$/i, "")     
//     .replace(/mobile.*$/i, "")    
//     .replace(/phone.*$/i, "")     
//     .replace(/[^A-Za-z\s]/g, "") 
//     .replace(/\s+/g, " ")        
//     .trim();
//   }

//   const skills = extractSkills(text);
//   const projectsRaw = extractSection("PROJECTS");
//   const achievementsRaw = extractSection("ACHIEVEMENTS");
//   const hobbies = extractSection("HOBBIES");
//   const experience = extractSection("EXPERIENCE");
//   const achievements = achievementsRaw.map(item => ({
//     title: item.split("\n")[0] || item,
//     description: item
//   }));
//   return {
//     name: extractName(text),
//     email: text.match(emailRegex)?.[0] || "",
//     phone: text.match(phoneRegex)?.[0] || "",
//     skills,
//     projects: projectsRaw.map(p => ({
//       title: p.split("\n")[0] || "",
//       description: p
//     })),
//     achievements,
//     hobbies,
//     experience: experience.map(e => ({
//       role: "",
//       company: "",
//       duration: "",
//       description: e
//     })),
//     rawText: text
//   };
// }

// function extractSkills(text) {
//   const skillsDB = [
//     // Frontend
//     "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular",
//     "HTML", "CSS", "Tailwind", "Bootstrap", "Redux", "Vite",

//     // Backend
//     "Node", "Express", "NestJS", "Spring Boot", "Django", "Flask",

//     // Databases
//     "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase",

//     // Tools
//     "Git", "GitHub", "Postman", "Docker",

//     // Languages
//     "Python", "Java", "C", "C++"
//   ];

//   return skillsDB.filter(skill =>
//     text.toLowerCase().includes(skill.toLowerCase())
//   );
// }

export function parseResumeText(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+91[\s-]?)?[6-9]\d{9}/;

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

  // ── EXPERIENCE DURATION HELPERS ────────────────────────────
  function parseDurationToMonths(durationStr) {
    if (!durationStr) return 0;

    const monthMap = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    const parseDate = (str) => {
      if (str.includes("present")) {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      }
      const tokens = str.trim().split(/\s+/);
      const month  = monthMap[tokens[0]?.slice(0, 3).toLowerCase()];
      const year   = parseInt(tokens[1]);
      if (isNaN(month) || isNaN(year)) return null;
      return new Date(year, month, 1);
    };

    const parts = durationStr
      .toLowerCase()
      .replace(/[–—]/g, "-")
      .split("-")
      .map(s => s.trim());

    if (parts.length < 2) return 0;

    const start = parseDate(parts[0]);
    const end   = parseDate(parts[1]);
    if (!start || !end) return 0;

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    return Math.max(0, months);
  }

  function calcTotalExperience(experienceArray) {
    const totalMonths = (experienceArray || []).reduce((sum, exp) => {
      return sum + parseDurationToMonths(exp.duration);
    }, 0);

    const years  = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    const text =
      totalMonths === 0      ? "Fresher"
      : years > 0 && months > 0 ? `${years} yr ${months} month`
      : years > 0               ? `${years} yr`
                                : `${months} month`;

    return { months: totalMonths, text };
  }
  // ──────────────────────────────────────────────────────────

  const skills        = extractSkills(text);
  const projectsRaw   = extractSection("PROJECTS");
  const achievementsRaw = extractSection("ACHIEVEMENTS");
  const hobbies       = extractSection("HOBBIES");
  const experienceRaw = extractSection("EXPERIENCE");

  const achievements = achievementsRaw.map(item => ({
    title: item.split("\n")[0] || item,
    description: item
  }));

  const experience = experienceRaw.map(e => ({
    role: "",
    company: "",
    duration: "",
    description: e
  }));

  // NOTE: duration will be empty here from rule parser.
  // calcTotalExperience runs AFTER AI fills in duration (in upload route).
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
    experience,
    rawText: text,
    // placeholder — will be recalculated after AI enhances duration
    totalExperience: { months: 0, text: "Fresher" },
    // expose helper so upload route can call it after AI fills duration
    _calcTotalExperience: calcTotalExperience
  };
}

function extractSkills(text) {
  const skillsDB = [
    "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular",
    "HTML", "CSS", "Tailwind", "Bootstrap", "Redux", "Vite",
    "Node", "Express", "NestJS", "Spring Boot", "Django", "Flask",
    "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase",
    "Git", "GitHub", "Postman", "Docker",
    "Python", "Java", "C", "C++"
  ];

  return skillsDB.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
}