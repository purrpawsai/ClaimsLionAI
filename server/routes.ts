import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeSupplyChainData } from "./services/openai";

import { insertAnalysisResultSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ 
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      // Keep the original extension
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      cb(null, filename);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['.csv', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV and XLSX files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Upload and analyze file
  app.post("/api/upload", upload.single('file'), async (req: any, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filename = req.file.originalname;
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      const filePath = req.file.path; // This is the local file path

      // Create initial analysis result record
      const analysisResult = await storage.createAnalysisResult({
        filename,
        fileUrl,
        jsonResponse: { status: "processing", message: "Analysis in progress..." }
      });

      // Process the entire file at once (no chunking needed)
      console.log(`📊 File size: ${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)}MB - Processing entire file`);
      
      // Start processing in background
      analyzeSupplyChainData(filePath, filename)
        .then(async (result) => {
          console.log("✅ Analysis completed successfully");
          await storage.updateAnalysisResult(analysisResult.id, result);
        })
        .catch(async (error) => {
          console.error("❌ Analysis error:", error);
          
          let errorMessage = "Analysis failed. Please try uploading again.";
          if (error.message.includes('encoding') || error.message.includes('characters')) {
            errorMessage = "File encoding issue detected. Please save your file as UTF-8 CSV and try again.";
          } else if (error.message.includes('JSON')) {
            errorMessage = "Data processing error. Please check your file format and try again.";
          } else if (error.message.includes('empty')) {
            errorMessage = "File appears to be empty or corrupted. Please check your file and try again.";
          }
          
          await storage.updateAnalysisResult(analysisResult.id, {
            status: "error",
            error: error.message,
            message: errorMessage
          });
        });

      // Return immediately with analysis ID
      res.json({
        success: true,
        analysisId: analysisResult.id,
        message: "File uploaded successfully. Analysis in progress...",
        chunked: false
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process file" 
      });
    }
  });

  // Get all analysis results
  app.get("/api/analysis", async (req, res) => {
    try {
      const results = await storage.getAnalysisResults();
      res.json(results);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch analysis results" 
      });
    }
  });

  // Get specific analysis result
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const result = await storage.getAnalysisResult(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      
      // Debug: Log array lengths
      if (result.jsonResponse) {
        console.log("🔍 Data array lengths:");
        console.log("- ForecastHighlights:", result.jsonResponse.ForecastHighlights?.length || 0);
        console.log("- ExpiringStock:", result.jsonResponse.ExpiringStock?.length || 0);
        console.log("- Recommendations:", result.jsonResponse.Recommendations?.length || 0);
        console.log("- Alerts:", result.jsonResponse.Alerts?.length || 0);
      }
      
      res.json(result);
    } catch (error) {
      console.error("Get analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch analysis result" 
      });
    }
  });

  // Get recommended actions for an analysis
  app.get("/api/analysis/:id/actions", async (req, res) => {
    try {
      const actions = await storage.getRecommendedActions(req.params.id);
      res.json(actions);
    } catch (error) {
      console.error("Get actions error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch recommended actions" 
      });
    }
  });

  // Delete specific analysis result
  app.delete("/api/analysis/:id", async (req, res) => {
    try {
      const result = await storage.deleteAnalysisResult(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json({ success: true, message: "Analysis deleted successfully" });
    } catch (error) {
      console.error("Delete analysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to delete analysis" 
      });
    }
  });

  // Chat endpoint for additional AI inquiries
  app.post("/api/chat/:analysisId", async (req, res) => {
    try {
      const { analysisId } = req.params;
      const { message } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Message is required and cannot be empty" });
      }

      // Get the analysis result to provide context
      const analysisResult = await storage.getAnalysisResult(analysisId);
      if (!analysisResult) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Store the user message
      await storage.createChatMessage({
        analysisId: analysisId,
        role: "user",
        content: message
      });

      // Get chat history for context
      const chatHistory = await storage.getChatMessages(analysisId);

      // Use OpenAI Chat Completions API for chat functionality
      const openai = new (await import('openai')).default({ 
        apiKey: process.env.OPENAI_API_KEY 
      });

      // Build messages array with system context and chat history
      const messages = [
        {
          role: "system",
          content: `You are RetailLionAI, an expert supply chain optimization assistant. You have previously analyzed the file "${analysisResult.filename}" with the following results:

📅 Today's Date: ${new Date().toISOString().split('T')[0]} (Use this for all date-related questions and calculations)

${JSON.stringify(analysisResult.jsonResponse, null, 2)}

The user is now asking follow-up questions about their supply chain data. Provide helpful, actionable insights based on the analysis. Keep responses concise and professional. Always use today's date (${new Date().toISOString().split('T')[0]}) for any date-related calculations or references.`
        },
        // Add chat history (excluding the system message we just added)
        ...chatHistory
          .filter(msg => msg.role !== "system")
          .map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          }))
      ];

      const chatResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages,
        max_tokens: 500,
        temperature: 0.7
      });

      const assistantResponse = chatResponse.choices[0].message.content || "I'm here to help with your supply chain analysis questions.";

      // Store the assistant response
      await storage.createChatMessage({
        analysisId: analysisId,
        role: "assistant",
        content: assistantResponse
      });

      res.json({ response: assistantResponse });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // Get chat history for an analysis
  app.get("/api/chat/:analysisId", async (req, res) => {
    try {
      const { analysisId } = req.params;
      const chatHistory = await storage.getChatMessages(analysisId);
      res.json(chatHistory);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Reanalyze existing file with updated AI logic
  app.post("/api/reanalyze/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysisResult = await storage.getAnalysisResult(id);
      
      if (!analysisResult) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      // Get the original file path from the fileUrl
      const fileName = analysisResult.fileUrl.split('/').pop();
      const filePath = `uploads/${fileName}`;

      // Check if file still exists
      const fs = await import('fs');
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Original file not found" });
      }

      // Reanalyze with updated AI logic
      const analysisResult = await analyzeSupplyChainData(filePath, analysisResult.filename);
      
      // Update the analysis result
      await storage.updateAnalysisResult(id, analysisResult);

      res.json({ success: true, message: "Analysis updated successfully" });
    } catch (error) {
      console.error("Reanalysis error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to reanalyze file" 
      });
    }
  });





  const httpServer = createServer(app);
  return httpServer;
}
