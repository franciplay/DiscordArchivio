import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPersonSchema, insertReportSchema } from "@shared/schema";
import type DiscordBot from "./discord-bot";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all people with their reports
  app.get("/api/people", async (req, res) => {
    try {
      const people = await storage.getAllPeople();
      res.json(people);
    } catch (error) {
      console.error("Error fetching people:", error);
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  // Get a specific person by name with reports
  app.get("/api/people/:name", async (req, res) => {
    try {
      const personName = decodeURIComponent(req.params.name);
      const person = await storage.getPersonByName(personName);
      
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      const reports = await storage.getReportsByPersonId(person.id);
      
      res.json({
        ...person,
        reports
      });
    } catch (error) {
      console.error("Error fetching person:", error);
      res.status(500).json({ message: "Failed to fetch person" });
    }
  });

  // Create a new report (and person if doesn't exist)
  app.post("/api/reports", async (req, res) => {
    try {
      const { personName, fact, reportedBy } = req.body;

      if (!personName || !fact || !reportedBy) {
        return res.status(400).json({
          error: "personName, fact, and reportedBy are required"
        });
      }

      // Check if person exists, create if not
      let person = await storage.getPersonByName(personName);
      if (!person) {
        // If person doesn't exist, try to find without class info
        const nameWithoutClass = personName.replace(/\s*\([^)]*\)$/, '').trim();
        person = await storage.getPersonByName(nameWithoutClass);
        
        if (!person) {
          // Create new person with full name (including class if provided)
          const personData = insertPersonSchema.parse({ name: personName });
          person = await storage.createPerson(personData);
        }
        // If person exists with base name, use existing person (don't create duplicate)
      }

      // Create the report
      const reportData = insertReportSchema.parse({
        personId: person.id,
        fact,
        reportedBy
      });

      const report = await storage.createReport(reportData);

      res.status(201).json({
        message: "Report created successfully",
        report,
        person
      });
    } catch (error) {
      console.error("Error creating report:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid data format" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all reports
  app.get("/api/reports", async (req, res) => {
    try {
      const reports = await storage.getAllReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  

  // Delete a person and all their reports
  app.delete("/api/people/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePerson(id);
      
      if (!success) {
        return res.status(404).json({ error: "Person not found" });
      }

      res.json({ message: "Person and all reports deleted successfully" });
    } catch (error) {
      console.error("Error deleting person:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete a specific report
  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteReport(id);
      
      if (!success) {
        return res.status(404).json({ error: "Report not found" });
      }

      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get bot statistics
  app.get("/api/bot/stats", async (req, res) => {
    try {
      const bot = req.app.get('discordBot') as DiscordBot;
      if (!bot) {
        return res.status(503).json({
          message: "Bot not available",
          isOnline: false,
          serverCount: 0,
          userCount: 0
        });
      }

      const stats = bot.getBotStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching bot stats:", error);
      res.status(500).json({
        message: "Failed to fetch bot stats",
        isOnline: false,
        serverCount: 0,
        userCount: 0
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}