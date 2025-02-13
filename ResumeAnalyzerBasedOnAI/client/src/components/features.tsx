import { CheckCircle, Search, TrendingUp, FileStack } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Search className="h-12 w-12 text-primary" />,
    title: "Smart Analysis",
    description: "Advanced AI scans your resume for key elements and provides detailed feedback"
  },
  {
    icon: <CheckCircle className="h-12 w-12 text-primary" />,
    title: "ATS Optimization",
    description: "Ensure your resume passes Applicant Tracking Systems with our optimization tools"
  },
  {
    icon: <TrendingUp className="h-12 w-12 text-primary" />,
    title: "Industry Insights",
    description: "Get tailored recommendations based on your industry and role"
  },
  {
    icon: <FileStack className="h-12 w-12 text-primary" />,
    title: "Format Checking",
    description: "Verify your resume formatting meets professional standards"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 md:px-6 lg:px-8 bg-muted/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Powerful Features
          </motion.h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered tools analyze every aspect of your resume to help you stand out
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="p-6 rounded-lg bg-background shadow-lg"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
