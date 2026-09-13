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

// --- SESSIONS DATABASE ---
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

export class SessionDatabase {
  private cache: import('./types').Session[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
          this.cache = data;
          return;
        }
      }
    } catch {}

    // Seed default active session
    const defaultSession: import('./types').Session = {
      id: 'sess-default-1',
      token: 'SESS-ROUND1',
      name: 'Hackathon Round 1 Live Session',
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    };
    this.cache = [defaultSession];
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save sessions:', err);
    }
  }

  public getAll(): import('./types').Session[] {
    return [...this.cache];
  }

  public getByToken(token: string): {
    session?: import('./types').Session;
    isValid: boolean;
    error?: 'Invalid' | 'Expired' | 'Paused' | 'Ended';
  } {
    const cleanToken = token.trim().toUpperCase();
    const session = this.cache.find((s) => s.token.toUpperCase() === cleanToken);

    if (!session) {
      return { isValid: false, error: 'Invalid' };
    }

    if (session.status === 'paused') {
      return { session, isValid: false, error: 'Paused' };
    }

    if (session.status === 'ended') {
      return { session, isValid: false, error: 'Ended' };
    }

    const isExpired = new Date(session.expiresAt).getTime() < Date.now();
    if (isExpired) {
      return { session, isValid: false, error: 'Expired' };
    }

    return { session, isValid: true };
  }

  public createSession(name: string = 'Live Fit Session', durationHours: number = 6): import('./types').Session {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const token = `SESS-${randomHex}`;
    const newSession: import('./types').Session = {
      id: `sess-${Date.now()}`,
      token,
      name,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationHours * 3600 * 1000).toISOString(),
    };

    this.cache.unshift(newSession);
    this.save();
    return newSession;
  }

  public updateStatus(token: string, status: import('./types').SessionStatus): import('./types').Session | null {
    const cleanToken = token.trim().toUpperCase();
    const session = this.cache.find((s) => s.token.toUpperCase() === cleanToken);
    if (!session) return null;

    session.status = status;
    this.save();
    return session;
  }
}

export const sessionDb = new SessionDatabase();

// --- PARTICIPANTS DATABASE ---
const PARTICIPANTS_FILE = path.join(DATA_DIR, 'participants.json');

export class ParticipantDatabase {
  private cache: import('./types').Participant[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(PARTICIPANTS_FILE)) {
        const raw = fs.readFileSync(PARTICIPANTS_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          this.cache = data;
          return;
        }
      }
    } catch {}
    this.cache = [];
  }

  private save() {
    try {
      fs.writeFileSync(PARTICIPANTS_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save participants:', err);
    }
  }

  public getAll(): import('./types').Participant[] {
    return [...this.cache];
  }

  public insert(participant: Omit<import('./types').Participant, 'id' | 'createdAt'>): import('./types').Participant {
    const item: import('./types').Participant = {
      ...participant,
      id: `part-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.cache.unshift(item);
    this.save();
    return item;
  }
}

export const participantDb = new ParticipantDatabase();

// --- IMAGE ANALYSES DATABASE ---
const ANALYSES_FILE = path.join(DATA_DIR, 'analyses.json');

export class AnalysisDatabase {
  private cache: import('./types').ImageAnalysis[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(ANALYSES_FILE)) {
        const raw = fs.readFileSync(ANALYSES_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
          this.cache = data;
          return;
        }
      }
    } catch {}
    this.cache = [];
  }

  private save() {
    try {
      fs.writeFileSync(ANALYSES_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save analyses:', err);
    }
  }

  public getAll(): import('./types').ImageAnalysis[] {
    return [...this.cache];
  }

  public insert(analysis: Omit<import('./types').ImageAnalysis, 'id' | 'createdAt'>): import('./types').ImageAnalysis {
    const item: import('./types').ImageAnalysis = {
      ...analysis,
      id: `ana-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.cache.unshift(item);
    this.save();
    return item;
  }
}

export const analysisDb = new AnalysisDatabase();

// --- PARTICIPANT FEEDBACK DATABASE ---
const PARTICIPANT_FEEDBACK_FILE = path.join(DATA_DIR, 'participant_feedback.json');

export class ParticipantFeedbackDatabase {
  private cache: import('./types').ParticipantFeedback[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(PARTICIPANT_FEEDBACK_FILE)) {
        const raw = fs.readFileSync(PARTICIPANT_FEEDBACK_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data) && data.length > 0) {
          this.cache = data;
          return;
        }
      }
    } catch {}

    // Pre-seed some realistic participant validation feedbacks
    this.cache = [
      {
        id: 'pf-1',
        participantId: 'part-demo-1',
        sessionId: 'sess-default-1',
        garmentType: 'Shirt',
        recommendedSize: 'M',
        actualSize: 'M',
        fitRating: 'Perfect',
        problemAreas: [],
        comment: 'Shoulders and chest fit remarkably well. Loved the fit recommendation!',
        sentiment: 'Positive',
        severity: 'Low',
        sizeDifference: 0,
        isCorrectSize: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'pf-2',
        participantId: 'part-demo-2',
        sessionId: 'sess-default-1',
        garmentType: 'Shirt',
        recommendedSize: 'M',
        actualSize: 'L',
        fitRating: 'Slightly Tight',
        problemAreas: ['Shoulder'],
        comment: 'The shoulders were slightly snug in M, had to take L for athletic broad shoulders.',
        sentiment: 'Neutral',
        severity: 'Medium',
        sizeDifference: 1,
        isCorrectSize: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'pf-3',
        participantId: 'part-demo-3',
        sessionId: 'sess-default-1',
        garmentType: 'T-Shirt',
        recommendedSize: 'L',
        actualSize: 'L',
        fitRating: 'Perfect',
        problemAreas: [],
        comment: 'Great oversized look, exactly as explained by the AI.',
        sentiment: 'Positive',
        severity: 'Low',
        sizeDifference: 0,
        isCorrectSize: true,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: 'pf-4',
        participantId: 'part-demo-4',
        sessionId: 'sess-default-1',
        garmentType: 'Jeans',
        recommendedSize: 'M',
        actualSize: 'M',
        fitRating: 'Slightly Loose',
        problemAreas: ['Waist'],
        comment: 'Waist has slight gap when sitting, but thigh and length are spot on.',
        sentiment: 'Neutral',
        severity: 'Low',
        sizeDifference: 0,
        isCorrectSize: true,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
    ];
    this.save();
  }

  private save() {
    try {
      fs.writeFileSync(PARTICIPANT_FEEDBACK_FILE, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save participant feedback:', err);
    }
  }

  public getAll(): import('./types').ParticipantFeedback[] {
    return [...this.cache];
  }

  public insert(feedback: Omit<import('./types').ParticipantFeedback, 'id' | 'createdAt'>): import('./types').ParticipantFeedback {
    const item: import('./types').ParticipantFeedback = {
      ...feedback,
      id: `pf-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    this.cache.unshift(item);
    this.save();
    return item;
  }
}

export const participantFeedbackDb = new ParticipantFeedbackDatabase();

