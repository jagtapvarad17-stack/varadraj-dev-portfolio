import { useState } from "react";
import { ExternalLink, Github, Smartphone, Globe, Box } from "lucide-react";
import { Button } from "@/components/ui/button";


type ProjectCategory = "all" | "web" | "android" | "ar";

interface Project {
  title: string;
  description: string;
  features: string[];
  techStack: string[];
  category: ProjectCategory;
  icon: typeof Globe;
  gradient: string;
}

const projects: Project[] = [
  {
    title: "AR-Based Furniture Shop Management System",
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
    category: "ar",
    icon: Box,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "YouBook – Digital Ledger App",
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
    category: "android",
    icon: Smartphone,
    gradient: "from-cyan-500 to-blue-500",
  },
];

const categories: { key: ProjectCategory; label: string }[] = [
  { key: "all", label: "All Projects" },
  { key: "web", label: "Web" },
  { key: "android", label: "Android" },
  { key: "ar", label: "AR" },
];

const Projects = () => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((project) => project.category === activeCategory);

  return (
    <section id="projects" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-2">My Work</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Featured <span className="gradient-text">Projects</span>
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

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {filteredProjects.map((project, index) => (
            <div
              key={project.title}
              className="glass-card rounded-2xl overflow-hidden group hover:border-primary/30 transition-all duration-300"
            >
              {/* Project Header */}
              <div className={`p-6 bg-gradient-to-r ${project.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-background/80" />
                <div className="relative z-10 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-background/20 backdrop-blur flex items-center justify-center">
                    <project.icon className="w-7 h-7 text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {project.title}
                    </h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {project.category.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {project.description}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Key Features
                  </h4>
                  <ul className="grid grid-cols-1 gap-2">
                    {project.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {/* <div className="flex gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-primary/50 text-primary hover:bg-primary/10 gap-2"
                  >
                    <Github className="w-4 h-4" />
                    Code
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </Button>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
