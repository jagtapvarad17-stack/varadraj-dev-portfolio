import { GraduationCap, Calendar } from "lucide-react";

const educationData = [
  {
    degree: "B.Tech in Information Technology",
    institution: "Walchand College of Engineering, Sangli",
    period: "2025 - Present",
    description:
      "Pursuing Bachelor's degree with focus on software development, algorithms, and modern web technologies.",
  },
  {
    degree: "Diploma in Computer Engineering",
    institution: "Government Polytechnic, Miraj",
    period: "2022 - 2025",
    description:
      "Completed diploma with strong foundation in computer science fundamentals and programming.",
  },
];

const Education = () => {
  return (
    <section id="education" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-medium mb-2">My Journey</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Education</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-transparent" />

            {educationData.map((edu, index) => (
              <div
                key={index}
                className="relative pl-20 pb-12 last:pb-0"
              >
                {/* Timeline dot */}
                <div className="absolute left-6 top-2 w-5 h-5 rounded-full bg-background border-2 border-primary glow-effect" />

                {/* Content card */}
                <div className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {edu.degree}
                      </h3>
                      <div className="flex items-center gap-2 text-primary">
                        <GraduationCap className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {edu.institution}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-4 h-4" />
                      {edu.period}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{edu.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
