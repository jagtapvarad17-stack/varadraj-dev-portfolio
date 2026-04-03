import React from "react";
import { ExternalLink, Github, Smartphone, Globe, Box } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Project {
  title: string;
  type: string;
  description: string;
  features: string[];
  techStack: string[];
  icon: typeof Box;
  headerBg: string;
  github?: string;
  demo?: string;
}

const projects: Project[] = [
  {
    title: "AR-Based Furniture Shop Management System",
    type: "AR",
    description:
      "A comprehensive furniture shop management solution featuring augmented reality preview capabilities, allowing customers to visualize furniture in their real space before purchase.",
    features: [
      "User authentication & authorization",
      "Product management dashboard",
      "Shopping cart & order processing",
      "AR furniture preview in real space",
      "Real-time API synchronization",
    ],
    techStack: ["React.js", "Node.js", "Express", "MongoDB", "Android", "AR Core"],
    icon: Box,
    headerBg: "bg-[#4a124a]",
  },

  {
    title: "YouBook – Digital Ledger App",
    type: "ANDROID",
    description:
      "A digital ledger application designed for small businesses to manage their financial transactions, track balances, and generate reports with a clean, intuitive interface.",
    features: [
      "Transaction tracking & history",
      "Balance management",
      "Secure data storage",
      "API sync & cloud backup",
      "Financial reporting",
    ],
    techStack: ["Android (Java)", "Retrofit", "SQLite", "REST API"],
    icon: Smartphone,
    headerBg: "bg-[#122a5a]",
  },

  {
    title: "SENTINEL AI – Android Malware Detection System",
    type: "AI / ML",
    description:
      "AI-powered malware detection system that analyzes APK files for potential security threats using machine learning algorithms. Features deep scanning and permission behavioral analysis.",
    features: [
      "APK file scanning",
      "Permission analysis",
      "Behavioral prediction",
      "ML-based classification",
      "Real-time monitoring",
    ],
    techStack: ["React", "Flask", "Scikit-learn", "Android"],
    icon: Globe,
    headerBg: "bg-[#123a12]",
    github: "https://github.com/jagtapvarad17-stack/APKMalwareDetection",
    demo: "http://localhost:5173",
  },

  {
    title: "TeachConnect – Smart Classroom App",
    type: "ANDROID",
    description:
      "A digital platform for teachers and students to manage assignments, share resources, and interact in real-time within a virtual classroom environment.",
    features: [
      "Secure authentication",
      "Assignment sharing",
      "Real-time announcements",
      "Resource management",
      "Integrated chat system",
    ],
    techStack: ["Android (Java)", "Firebase", "RecyclerView", "REST API"],
    icon: Smartphone,
    headerBg: "bg-[#2a125a]",
    github: "https://github.com/YOUR_TEACHCONNECT_LINK",
  },
];

const Projects = () => {
  const sectionRef = useScrollAnimation<HTMLElement>(".scroll-animate");

  return (
    <section
      id="projects"
      className="py-24 relative overflow-hidden"
      ref={sectionRef}
    >
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 -z-10" />

      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16 scroll-animate scroll-fade-up">
          <p className="text-primary font-medium mb-2 uppercase tracking-wider text-sm">
            Portfolio
          </p>
          <h2 className="text-4xl md:text-5xl font-bold">
            Featured <span className="gradient-text">Projects</span>
          </h2>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div
              key={project.title}
              className="group bg-[#16161c]/90 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden flex flex-col scroll-animate scroll-fade-up border border-white/10 hover:border-primary/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
              style={{ transitionDelay: `${0.1 + index * 0.1}s` }}
            >
              {/* Colored Header */}
              <div className={`p-8 ${project.headerBg} relative overflow-hidden transition-colors duration-500`}>
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="p-4 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-lg">
                    <project.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                      {project.title}
                    </h3>
                    <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-[#06b6d4] text-[10px] font-black tracking-[0.15em] uppercase border border-[#06b6d4]/20">
                      {project.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-10 flex flex-col h-full bg-gradient-to-b from-transparent to-black/20">
                
                {/* Description */}
                <p className="text-[#a1a1aa] leading-relaxed mb-10 text-[15px] font-medium">
                  {project.description}
                </p>

                {/* Key Features */}
                <div className="mb-10">
                  <h4 className="text-white font-bold mb-5 text-lg flex items-center gap-2">
                    Key Features
                  </h4>
                  <ul className="space-y-4">
                    {project.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 group/item">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.6)] flex-shrink-0 transition-transform duration-300 group-hover/item:scale-125" />
                        <span className="text-[#d4d4d8] text-sm font-medium leading-normal">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div className="mb-10">
                  <h4 className="text-white font-bold mb-5 text-lg">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-4 py-2 text-xs font-semibold bg-black/40 text-[#f4f4f5] rounded-full border border-white/5 hover:border-[#06b6d4]/40 hover:bg-[#06b6d4]/5 transition-all duration-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons (Appended if links exist) */}
                {(project.github || project.demo) && (
                  <div className="flex gap-4 mt-auto pt-8 border-t border-white/5">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-bold transition-all duration-300 border border-white/10"
                      >
                        <Github className="w-4.5 h-4.5" />
                        Code
                      </a>
                    )}

                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition-all duration-300 border border-primary/20"
                      >
                        <ExternalLink className="w-4.5 h-4.5" />
                        Check out
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;