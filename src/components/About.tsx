import React from "react";
import { Code2, Server, Smartphone, Box } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import MagicBentoCard from "@/components/ui/MagicBentoCard";
import Lanyard from "@/components/ui/Lanyard";

const GLOW = "0, 208, 255";

const strengths = [
  {
    icon: Code2,
    title: "Full Stack Development",
    description: "End-to-end web application development with modern frameworks",
  },
  {
    icon: Server,
    title: "Backend API Architecture",
    description: "Scalable RESTful APIs with Node.js, Express & Django",
  },
  {
    icon: Smartphone,
    title: "Mobile + Web Solutions",
    description: "Cross-platform development for Android and responsive web",
  },
  {
    icon: Box,
    title: "AR Technology",
    description: "Augmented Reality integration for immersive user experiences",
  },
];

const About = () => {
  const sectionRef = useScrollAnimation<HTMLElement>(".scroll-animate");

  return (
    <section id="about" className="py-24 relative" ref={sectionRef}>
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 scroll-animate scroll-fade-up">
          <p className="text-primary font-medium mb-2">Get To Know</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            About <span className="gradient-text">Me</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Replaced Bio with interactive 3D Lanyard Card */}
          <div
            className="scroll-animate scroll-fade-left w-full h-[600px]"
            style={{ transitionDelay: "0.1s" }}
          >
            <Lanyard position={[0, 0, 13]} gravity={[0, -40, 0]} />
          </div>

          {/* Strengths Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {strengths.map((strength, index) => (
              <div
                key={strength.title}
                className="scroll-animate scroll-scale-in"
                style={{ transitionDelay: `${0.15 + index * 0.1}s` }}
              >
                <MagicBentoCard
                  glowColor={GLOW}
                  spotlightRadius={280}
                  particleCount={8}
                  enableSpotlight
                  enableBorderGlow
                  enableStars
                  clickEffect
                  className="rounded-xl p-6 group h-full"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <strength.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {strength.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {strength.description}
                  </p>
                </MagicBentoCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
