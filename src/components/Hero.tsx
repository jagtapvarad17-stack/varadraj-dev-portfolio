import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import profilePhoto from "@/assets/profile-photo.jpg";

const Hero = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
    >
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-glow-gradient opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-primary font-medium mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Hello, I'm
            </p>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="text-foreground">VaradraJ</span>{" "}
              <span className="gradient-text">Jagtap</span>
            </h1>
            <h2
              className="text-xl md:text-2xl text-muted-foreground mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              Full Stack Developer | MERN Stack | Android Developer
            </h2>
            <p
              className="text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 text-lg animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              Building scalable web & mobile solutions with modern technologies.
              Passionate about creating innovative, user-focused applications.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 group"
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Projects
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/50 text-primary hover:bg-primary/10"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                Contact Me
              </Button>
            </div>

            {/* Social Links */}
            <div
              className="flex gap-4 justify-center lg:justify-start animate-fade-in-up"
              style={{ animationDelay: "0.6s" }}
            >
              <a
                href="https://github.com/varadrajjagtap"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 glass-card rounded-full hover:bg-primary/20 transition-colors group"
              >
                <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="https://linkedin.com/in/varadrajjagtap"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 glass-card rounded-full hover:bg-primary/20 transition-colors group"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
              <a
                href="mailto:varadrajjagtap@gmail.com"
                className="p-3 glass-card rounded-full hover:bg-primary/20 transition-colors group"
              >
                <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </a>
            </div>
          </div>

          {/* Profile Photo */}
          <div
            className="flex-shrink-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-xl opacity-50 animate-glow-pulse" />
              
              {/* Photo container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-primary/30 glow-effect">
                <img
                  src={profilePhoto}
                  alt="VaradraJ Jagtap"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
