
import { type Person, type InsertPerson, type Report, type InsertReport } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

interface PersonWithReports extends Person {
  reports: Report[];
}

interface StorageData {
  people: Person[];
  reports: Report[];
}

export interface IStorage {
  // Person operations
  getPerson(id: string): Promise<Person | undefined>;
  getPersonByName(name: string): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  getAllPeople(): Promise<PersonWithReports[]>;
  deletePerson(id: string): Promise<boolean>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReportsByPersonId(personId: string): Promise<Report[]>;
  getAllReports(): Promise<Report[]>;
  deleteReport(id: string): Promise<boolean>;
}

export class FileStorage implements IStorage {
  private people: Map<string, Person>;
  private reports: Map<string, Report>;
  private dataFile: string;

  constructor() {
    this.people = new Map();
    this.reports = new Map();
    this.dataFile = join(process.cwd(), 'bot-data.json');
    this.loadData();
  }

  private loadData() {
    try {
      if (existsSync(this.dataFile)) {
        const data: StorageData = JSON.parse(readFileSync(this.dataFile, 'utf8'));
        
        // Carica persone
        data.people.forEach(person => {
          this.people.set(person.id, person);
        });
        
        // Carica report (converte createdAt da string a Date)
        data.reports.forEach(report => {
          this.reports.set(report.id, {
            ...report,
            createdAt: new Date(report.createdAt)
          });
        });
        
        console.log(`Caricati ${data.people.length} persone e ${data.reports.length} report dal file`);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
    }
  }

  private saveData() {
    try {
      const data: StorageData = {
        people: Array.from(this.people.values()),
        reports: Array.from(this.reports.values())
      };
      
      writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Errore nel salvataggio dei dati:', error);
    }
  }

  async getPerson(id: string): Promise<Person | undefined> {
    return this.people.get(id);
  }

  async getPersonByName(name: string): Promise<Person | undefined> {
    return Array.from(this.people.values()).find(
      (person) => person.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const id = randomUUID();
    const person: Person = { ...insertPerson, id };
    this.people.set(id, person);
    this.saveData();
    return person;
  }

  async getAllPeople(): Promise<PersonWithReports[]> {
    const peopleWithReports: PersonWithReports[] = [];
    
    for (const person of Array.from(this.people.values())) {
      const reports = await this.getReportsByPersonId(person.id);
      peopleWithReports.push({
        ...person,
        reports
      });
    }
    
    return peopleWithReports;
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = {
      ...insertReport,
      id,
      createdAt: new Date()
    };
    this.reports.set(id, report);
    this.saveData();
    return report;
  }

  async getReportsByPersonId(personId: string): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.personId === personId,
    );
  }

  async getAllReports(): Promise<Report[]> {
    return Array.from(this.reports.values());
  }

  async deletePerson(id: string): Promise<boolean> {
    const person = this.people.get(id);
    if (!person) {
      return false;
    }

    // Delete all reports for this person
    const personReports = Array.from(this.reports.values()).filter(
      report => report.personId === id
    );
    personReports.forEach(report => {
      this.reports.delete(report.id);
    });

    // Delete the person
    this.people.delete(id);
    this.saveData();
    
    console.log(`Eliminata persona ${person.name} con ${personReports.length} report`);
    return true;
  }

  async deleteReport(id: string): Promise<boolean> {
    const report = this.reports.get(id);
    if (!report) {
      return false;
    }

    this.reports.delete(id);
    this.saveData();
    
    console.log(`Eliminato report: ${report.fact}`);
    return true;
  }
}

export const storage = new FileStorage();
