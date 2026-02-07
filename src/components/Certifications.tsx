import { Award, ExternalLink } from "lucide-react";

const certifications = [
  {
    title: "MERN Stack Full Stack Development",
    issuer: "Udemy",
    color: "from-purple-500 to-pink-500",
  },/*
  {
    title: "Python Programming",
    issuer: "HackerRank",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "SQL Certification",
    issuer: "HackerRank",
    color: "from-blue-500 to-cyan-500",
  },*/
];

const Certifications = () => {
  return (
    <section id="certifications" className="py-24 relative">
      <div className="absolute inset-0 bg-glow-gradient opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-2">Achievements</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Certifications</span>
          </h2>
        </div>

        {/* Certifications Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {certifications.map((cert, index) => (
            <div
              key={cert.title}
              className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group cursor-pointer"
            >
              {/* Badge Icon */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cert.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Award className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {cert.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Issued by {cert.issuer}
              </p>

              {/* View Link */}
              <div className="flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                <span>View Certificate</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
