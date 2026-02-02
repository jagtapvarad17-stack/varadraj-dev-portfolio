import { Code2, Server, Smartphone, Box, Sparkles } from "lucide-react";

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
  {
    icon: Sparkles,
    title: "Clean Code & Optimization",
    description: "Performance-focused code with best practices & standards",
  },
];

const About = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="absolute inset-0 bg-glow-gradient opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-2">Get To Know</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            About <span className="gradient-text">Me</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Bio */}
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              Professional Bio
            </h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                I'm a passionate Full Stack Developer with expertise in the{" "}
                <span className="text-primary font-medium">MERN Stack</span> and{" "}
                <span className="text-primary font-medium">Android Development</span>.
                My journey in software development has been driven by a desire to create
                impactful solutions that solve real-world problems.
              </p>
              <p>
                I specialize in building scalable web and mobile applications,
                with hands-on experience in{" "}
                <span className="text-primary font-medium">AR-based systems</span>{" "}
                that deliver immersive user experiences. My approach combines
                technical excellence with user-centered design principles.
              </p>
              <p>
                Whether it's crafting intuitive user interfaces, designing robust
                backend architectures, or integrating cutting-edge technologies,
                I'm committed to delivering solutions that exceed expectations
                and drive business value.
              </p>
            </div>
          </div>

          {/* Strengths Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {strengths.map((strength, index) => (
              <div
                key={strength.title}
                className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group"
                style={{ animationDelay: `${index * 0.1}s` }}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
