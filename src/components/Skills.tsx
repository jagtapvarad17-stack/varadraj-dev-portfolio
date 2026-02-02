import { useState } from "react";

type SkillCategory = "all" | "languages" | "frontend" | "backend" | "mobile" | "tools";

interface Skill {
  name: string;
  level: number;
  category: SkillCategory;
}

const skills: Skill[] = [
  // Languages
  { name: "Python", level: 85, category: "languages" },
  { name: "Java", level: 90, category: "languages" },
  { name: "JavaScript", level: 95, category: "languages" },
  { name: "C++", level: 75, category: "languages" },
  
  // Frontend
  { name: "React.js", level: 92, category: "frontend" },
  { name: "HTML5", level: 95, category: "frontend" },
  { name: "CSS3", level: 90, category: "frontend" },
  { name: "Bootstrap", level: 85, category: "frontend" },
  
  // Backend
  { name: "Node.js", level: 90, category: "backend" },
  { name: "Express.js", level: 88, category: "backend" },
  { name: "Django REST", level: 80, category: "backend" },
  { name: "MongoDB", level: 85, category: "backend" },
  { name: "MySQL", level: 82, category: "backend" },
  
  // Mobile
  { name: "Android (Java)", level: 88, category: "mobile" },
  { name: "Retrofit", level: 80, category: "mobile" },
  
  // Tools
  { name: "Git", level: 90, category: "tools" },
  { name: "GitHub", level: 92, category: "tools" },
  { name: "Postman", level: 88, category: "tools" },
  { name: "MongoDB Compass", level: 85, category: "tools" },
  { name: "Android Studio", level: 90, category: "tools" },
];

const categories: { key: SkillCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "languages", label: "Languages" },
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend & APIs" },
  { key: "mobile", label: "Mobile" },
  { key: "tools", label: "Tools" },
];

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>("all");

  const filteredSkills =
    activeCategory === "all"
      ? skills
      : skills.filter((skill) => skill.category === activeCategory);

  return (
    <section id="skills" className="py-24 relative">
      <div className="absolute inset-0 bg-glow-gradient opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-2">My Expertise</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Technical <span className="gradient-text">Skills</span>
          </h2>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category.key
                  ? "bg-primary text-primary-foreground"
                  : "glass-card text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {filteredSkills.map((skill, index) => (
            <div
              key={skill.name}
              className="glass-card rounded-xl p-5 hover:border-primary/30 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {skill.name}
                </h4>
                <span className="text-sm text-primary font-medium">
                  {skill.level}%
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700 skill-bar"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
