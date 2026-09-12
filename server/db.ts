import fs from 'fs';
import path from 'path';
import { Feedback, FilterParams } from './types';
import { generateSeedData } from './seedData';

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'feedback.json');

export class FeedbackDatabase {
  private cache: Feedback[] = [];

  constructor() {
    this.ensureDirectory();
    this.load();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
          this.cache = data;
          return;
        }
      }
    } catch {
      // ignore parse errors and seed
    }

    // Seed if empty or missing
    this.cache = generateSeedData();
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  public getAll(): Feedback[] {
    return [...this.cache].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getById(id: string): Feedback | undefined {
    return this.cache.find((f) => f.id === id);
  }

  public insert(item: Feedback): Feedback {
    this.cache.unshift(item);
    this.save();
    return item;
  }

  public resetDemoData(): Feedback[] {
    this.cache = generateSeedData();
    this.save();
    return this.getAll();
  }

  public clearAll(): Feedback[] {
    this.cache = [];
    this.save();
    return [];
  }

  public filter(params: FilterParams): Feedback[] {
    let result = this.getAll();

    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (f) =>
          f.product.toLowerCase().includes(q) ||
          f.brand.toLowerCase().includes(q) ||
          f.comment.toLowerCase().includes(q) ||
          f.garmentType.toLowerCase().includes(q)
      );
    }

    if (params.brand) {
      result = result.filter((f) => f.brand.toLowerCase() === params.brand?.toLowerCase());
    }

    if (params.garmentType) {
      result = result.filter((f) => f.garmentType.toLowerCase() === params.garmentType?.toLowerCase());
    }

    if (params.size) {
      result = result.filter((f) => f.size === params.size);
    }

    if (params.bodyArea) {
      result = result.filter((f) =>
        f.bodyAreas.some((b) => b.area.toLowerCase() === params.bodyArea?.toLowerCase())
      );
    }

    if (params.issueType) {
      result = result.filter((f) =>
        f.bodyAreas.some((b) => b.issue.toLowerCase() === params.issueType?.toLowerCase())
      );
    }

    if (params.fitPreference) {
      result = result.filter((f) => f.fitPreference.toLowerCase() === params.fitPreference?.toLowerCase());
    }

    if (params.returnReason) {
      result = result.filter((f) => f.returnReason.toLowerCase() === params.returnReason?.toLowerCase());
    }

    if (params.sentiment) {
      result = result.filter((f) => f.aiAnalysis.sentiment.toLowerCase() === params.sentiment?.toLowerCase());
    }

    if (params.severity) {
      result = result.filter((f) => f.aiAnalysis.severity.toLowerCase() === params.severity?.toLowerCase());
    }

    if (params.minRating) {
      result = result.filter((f) => f.overallRating >= Number(params.minRating));
    }

    if (params.maxRating) {
      result = result.filter((f) => f.overallRating <= Number(params.maxRating));
    }

    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      result = result.filter((f) => new Date(f.timestamp).getTime() >= start);
    }

    if (params.endDate) {
      const end = new Date(params.endDate).getTime();
      result = result.filter((f) => new Date(f.timestamp).getTime() <= end);
    }

    return result;
  }
}

export const db = new FeedbackDatabase();
