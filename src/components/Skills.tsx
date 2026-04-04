import React from "react";
import { useState } from "react";
import {
  Code2,
  Database,
  Globe,
  Smartphone,
  Wrench,
  FileCode,
  Layout,
  Server,
  Terminal,
  GitBranch,
  Box,
  Layers,
  Cpu,
  MonitorSmartphone
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

type SkillCategory = "all" | "languages" | "frontend" | "backend" | "mobile" | "tools";

interface Skill {
  name: string;
  icon: React.ReactNode;
  category: SkillCategory;
}

const skills: Skill[] = [
  // Languages
  { name: "Python", icon: <FileCode className="w-8 h-8" />, category: "languages" },
  { name: "Java", icon: <Code2 className="w-8 h-8" />, category: "languages" },
  { name: "JavaScript", icon: <Terminal className="w-8 h-8" />, category: "languages" },
  { name: "C++", icon: <Cpu className="w-8 h-8" />, category: "languages" },

  // Frontend
  { name: "React.js", icon: <Layers className="w-8 h-8" />, category: "frontend" },
  { name: "HTML5", icon: <Layout className="w-8 h-8" />, category: "frontend" },
  { name: "CSS3", icon: <Globe className="w-8 h-8" />, category: "frontend" },
  { name: "Bootstrap", icon: <Box className="w-8 h-8" />, category: "frontend" },

  // Backend
  { name: "Node.js", icon: <Server className="w-8 h-8" />, category: "backend" },
  { name: "Express.js", icon: <Server className="w-8 h-8" />, category: "backend" },
  { name: "Django REST", icon: <Database className="w-8 h-8" />, category: "backend" },
  { name: "MongoDB", icon: <Database className="w-8 h-8" />, category: "backend" },
  { name: "MySQL", icon: <Database className="w-8 h-8" />, category: "backend" },

  // Mobile
  { name: "Android (Java)", icon: <Smartphone className="w-8 h-8" />, category: "mobile" },
  { name: "Retrofit", icon: <MonitorSmartphone className="w-8 h-8" />, category: "mobile" },

  // Tools
  { name: "Git", icon: <GitBranch className="w-8 h-8" />, category: "tools" },
  { name: "GitHub", icon: <GitBranch className="w-8 h-8" />, category: "tools" },
  { name: "Postman", icon: <Wrench className="w-8 h-8" />, category: "tools" },
  { name: "MongoDB Compass", icon: <Database className="w-8 h-8" />, category: "tools" },
  { name: "Android Studio", icon: <Smartphone className="w-8 h-8" />, category: "tools" },
];



const Skills = () => {
  const [activeCategory, setActiveCategory] = useState<SkillCategory>("all");
  const sectionRef = useScrollAnimation<HTMLElement>(".scroll-animate");

  const filteredSkills =
    activeCategory === "all"
      ? skills
      : skills.filter((skill) => skill.category === activeCategory);

  return (
    <section id="skills" className="py-24 relative" ref={sectionRef}>
      <div className="absolute inset-0 bg-glow-gradient opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-animate scroll-fade-up">
          <p className="text-primary font-medium mb-2">My Expertise</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Technical <span className="gradient-text">Skills</span>
          </h2>
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {filteredSkills.map((skill, index) => (
            <div
              key={skill.name}
              className="glass-card rounded-xl p-6 hover:border-primary/50 transition-all duration-300 group flex flex-col items-center justify-center text-center hover:scale-105 scroll-animate scroll-scale-in"
              style={{ transitionDelay: `${0.05 * index}s` }}
            >
              <div className="text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                {skill.icon}
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {skill.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
