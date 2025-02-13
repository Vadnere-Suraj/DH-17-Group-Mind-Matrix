import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { spawn } from "child_process";
import { mkdir } from "fs/promises";
import { existsSync } from "fs";

// Configure multer for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads",
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, "resume-" + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: function (req, file, cb) {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and Word documents are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export function registerRoutes(app: Express): Server {
  // Create uploads directory if it doesn't exist
  (async () => {
    try {
      if (!existsSync("./uploads")) {
        await mkdir("./uploads", { recursive: true });
      }
    } catch (err) {
      console.error("Error creating uploads directory:", err);
    }
  })();

  // Resume upload and analysis endpoint
  app.post("/api/analyze-resume", upload.single("resume"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          error: "No file uploaded",
          details: "Please select a file to upload"
        });
      }

      console.log("Processing file:", req.file.path);

      // Run Python script for analysis
      const pythonProcess = spawn("python", [
        "attached_assets/AI_Powered_Resume_Analyzer.py",
        req.file.path
      ]);

      let stdoutData = "";
      let stderrData = "";

      pythonProcess.stdout.on("data", (data) => {
        const output = data.toString();
        console.log("Python script output:", output);
        stdoutData += output;
      });

      pythonProcess.stderr.on("data", (data) => {
        const error = data.toString();
        console.error("Python script error:", error);
        stderrData += error;
      });

      // Set a timeout for the Python process
      const timeout = setTimeout(() => {
        pythonProcess.kill();
        return res.status(500).json({
          error: "Analysis timeout",
          details: "The analysis took too long to complete. Please try again."
        });
      }, 45000); // 45 seconds timeout to account for retries

      pythonProcess.on("close", (code) => {
        clearTimeout(timeout);

        if (code !== 0) {
          console.error("Python script failed with code:", code);
          console.error("Error output:", stderrData);

          // Handle specific error cases
          if (stderrData.includes("429 Resource has been exhausted")) {
            return res.status(429).json({
              error: "API rate limit exceeded",
              details: "The service is experiencing high demand. Please try again in a few minutes."
            });
          }

          if (stderrData.includes("Error reading PDF")) {
            return res.status(400).json({
              error: "Invalid PDF file",
              details: "The uploaded file could not be read. Please ensure it's a valid PDF document."
            });
          }

          return res.status(500).json({
            error: "Analysis failed",
            details: "There was an error analyzing your resume. Please try again."
          });
        }

        try {
          console.log("Raw Python output:", stdoutData);

          // Parse JSON output from Python script
          const results = JSON.parse(stdoutData);

          // Validate the expected structure
          if (!results.summary || !results.strengths || 
              !results.weaknesses || !results.jobSuggestions) {
            throw new Error("Invalid analysis results structure");
          }

          res.json(results);
        } catch (error: any) {
          console.error("Error parsing analysis results:", error);
          res.status(500).json({
            error: "Failed to parse analysis results",
            details: "There was an error processing the analysis results. Please try again."
          });
        }
      });
    } catch (error: any) {
      console.error("Server error:", error);
      res.status(500).json({
        error: "Server error",
        details: "An unexpected error occurred. Please try again."
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}