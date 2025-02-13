import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import FileUpload from "@/components/file-upload";
import Features from "@/components/features";
import Pricing from "@/components/pricing";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Analyze Your Resume with{" "}
            <span className="text-primary">AI Precision</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Upload your resume and get instant insights, suggestions, and improvements 
            powered by advanced AI analysis.
          </p>
          <FileUpload />
        </motion.div>
      </section>

      {/* Background Image Section */}
      <div className="relative h-64 md:h-96 my-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1627389955611-70c92a5d2e2b')`
          }}
        />
      </div>

      <Features />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
}
