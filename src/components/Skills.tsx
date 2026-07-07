import { useState } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import MagicBentoCard from "@/components/ui/MagicBentoCard";

const GLOW = "0, 208, 255";

// CDN base — Simple Icons (https://simpleicons.org) served via jsDelivr
const SI = (slug: string) =>
  `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;

// Devicons for logos Simple Icons doesn't cover well
const DI = (slug: string) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;

type SkillCategory = "all" | "languages" | "frontend" | "backend" | "mobile" | "tools";

interface Skill {
  name: string;
  logo: string;
  /** invert: true → white SVG tint for dark-bg logos (Simple Icons are black by default) */
  invert?: boolean;
  category: SkillCategory;
}

const skills: Skill[] = [
  // Languages
  { name: "Python",      logo: DI("python"),        category: "languages" },
  { name: "Java",        logo: DI("java"),           category: "languages" },
  { name: "JavaScript",  logo: DI("javascript"),     category: "languages" },
  { name: "C++",         logo: DI("cplusplus"),      category: "languages" },

  // Frontend
  { name: "React.js",    logo: DI("react"),          category: "frontend" },
  { name: "HTML5",       logo: DI("html5"),          category: "frontend" },
  { name: "CSS3",        logo: DI("css3"),           category: "frontend" },
  { name: "Bootstrap",   logo: DI("bootstrap"),      category: "frontend" },
  { name: "Tailwind",    logo: SI("tailwindcss"),    invert: true, category: "frontend" },

  // Backend
  { name: "Node.js",     logo: DI("nodejs"),         category: "backend" },
  { name: "Express.js",  logo: SI("express"),        invert: true, category: "backend" },
  { name: "Django",      logo: SI("django"),         invert: true, category: "backend" },
  { name: "MongoDB",     logo: DI("mongodb"),        category: "backend" },
  { name: "MySQL",       logo: DI("mysql"),          category: "backend" },

  // Mobile
  { name: "Android",     logo: SI("android"),        invert: true, category: "mobile" },
  { name: "Retrofit",    logo: SI("square"),         invert: true, category: "mobile" },

  // Tools
  { name: "Git",         logo: DI("git"),            category: "tools" },
  { name: "GitHub",      logo: SI("github"),         invert: true, category: "tools" },
  { name: "Postman",     logo: SI("postman"),        category: "tools" },
  { name: "VS Code",     logo: SI("visualstudiocode"), invert: true, category: "tools" },
  { name: "Android Studio", logo: SI("androidstudio"), invert: true, category: "tools" },
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
              className="scroll-animate scroll-scale-in"
              style={{ transitionDelay: `${0.05 * index}s` }}
            >
              <MagicBentoCard
                glowColor={GLOW}
                spotlightRadius={180}
                particleCount={6}
                enableSpotlight
                enableBorderGlow
                enableStars
                clickEffect
                className="rounded-xl p-6 group flex flex-col items-center justify-center text-center hover:scale-105 transition-transform duration-300 h-full"
              >
                <div className="mb-3 group-hover:scale-110 transition-transform duration-300 w-10 h-10 flex items-center justify-center">
                  <img
                    src={skill.logo}
                    alt={skill.name}
                    width={36}
                    height={36}
                    loading="lazy"
                    style={skill.invert ? { filter: "invert(1) brightness(2)" } : undefined}
                    onError={(e) => {
                      // Fallback: hide broken image, show first 2 chars of name
                      const target = e.currentTarget;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement | null;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  {/* Fallback shown only when img fails to load */}
                  <span
                    className="text-primary font-bold text-lg hidden items-center justify-center w-9 h-9 rounded bg-primary/10"
                    aria-hidden="true"
                  >
                    {skill.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {skill.name}
                </span>
              </MagicBentoCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
