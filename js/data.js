/* Data model and defaults for the resume builder */
(function (global) {
  "use strict";

  var STORAGE_KEY = "resumeBuilderDataV1";

  var DEFAULT_RESUME = {
    personal: {
      fullName: "Jane Doe",
      jobTitle: "Software Engineer",
      email: "jane@example.com",
      phone: "+1 555 000 0000",
      location: "City, State",
      website: "jane.dev",
      summary: "Computer Science student with a strong foundation in software development..." 
    },
    education: [
      {
        school: "University of Technology",
        degree: "B.Sc. in Computer Science",
        dates: "2022 - 2026",
        details: "GPA: 3.8 / 4.0"
      }
    ],
    experience: [
      {
        company: "Tech Solutions Inc.",
        role: "Software Engineer Intern",
        dates: "May 2025 - Aug 2025",
        jobSummary: "Worked on the core product dashboard and internal tooling.",
        bullets: [
          "Built a reusable chart component used across 5+ client reports",
          "Reduced page load time by 30% by optimizing API query batching"
        ]
      }
    ],
    skills: [
      {
        group: "Languages",
        items: ["JavaScript", "Python", "C++"]
      },
      {
        group: "Tools",
        items: ["Git", "React", "Node.js"]
      }
    ],
    projects: [
      {
        name: "Resume Builder",
        dates: "2026",
        link: "github.com/janedoe/resume-builder",
        description: "A single-page app that lets users design and export ATS-friendly resumes."
      }
    ],
    template: "modern",
    accent: "#2563eb"
  };

  function emptyResume() {
    return {
      personal: {
        fullName: "",
        jobTitle: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        summary: ""
      },
      education: [],
      experience: [],
      skills: [],
      projects: [],
      template: "modern",
      accent: "#2563eb"
    };
  }

  global.Data = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_RESUME: DEFAULT_RESUME,
    emptyResume: emptyResume
  };
})(window);