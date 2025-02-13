import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AnalysisResults {
  summary: string;
  strengths: string;
  weaknesses: string;
  jobSuggestions: string;
}

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setError(null);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => 
      file.type === "application/pdf" || 
      file.type === "application/msword" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    if (validFiles.length === 0) {
      setError("Please upload PDF or Word documents only");
      toast({
        title: "Invalid file type",
        description: "Please upload PDF or Word documents only",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      const formData = new FormData();
      formData.append("resume", validFiles[0]);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Analysis failed");
      }

      setResults(data);
      toast({
        title: "Analysis Complete",
        description: "Your resume has been analyzed successfully"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze resume";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
      setResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="mb-8"
      >
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/10" : "border-muted"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isAnalyzing ? "Analyzing your resume..." : "Drop your resume here or browse"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Supports PDF, DOC, DOCX
          </p>
          <Button
            variant="default"
            className="cursor-pointer relative"
            disabled={isAnalyzing}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            {isAnalyzing ? "Processing..." : "Select File"}
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileInput}
              disabled={isAnalyzing}
            />
          </Button>
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resume Summary</CardTitle>
              <CardDescription>Overall analysis of your resume</CardDescription>
            </CardHeader>
            <CardContent className="whitespace-pre-line">
              {results.summary}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strengths</CardTitle>
              <CardDescription>Key strong points in your resume</CardDescription>
            </CardHeader>
            <CardContent className="whitespace-pre-line">
              {results.strengths}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Areas for Improvement</CardTitle>
              <CardDescription>Suggestions to enhance your resume</CardDescription>
            </CardHeader>
            <CardContent className="whitespace-pre-line">
              {results.weaknesses}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended Job Titles</CardTitle>
              <CardDescription>Suggested roles based on your profile</CardDescription>
            </CardHeader>
            <CardContent className="whitespace-pre-line">
              {results.jobSuggestions}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}