import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { db, sessionDb, participantDb, analysisDb, participantFeedbackDb } from './db';
import { analyzeFeedback } from './nlpEngine';
import { computeAnalytics, computeSizeSpecificAnalysis, computeHeatmap } from './analyticsEngine';
import { generateRecommendations, generateDesignerActionPlan } from './recommendationEngine';
import {
  validateImageQuality,
  estimateBodyProportions,
  recommendSize,
  computeRecommendationAccuracy,
  generateBrandInsightsFromData,
} from './services/fitAnalysisService';
import { Feedback, FilterParams, Size, GarmentType, FitPreference, SessionStatus } from './types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer setup for optional image upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `fit-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, or WebP images are allowed.'));
    }
  },
});

// --- ROUTES ---

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Clothing Fit Feedback & Intelligence System API is healthy',
    timestamp: new Date().toISOString(),
    recordsCount: db.getAll().length,
  });
});

// Tunnel info for QR code & mobile sharing
app.get('/api/tunnel-info', (_req: Request, res: Response) => {
  let publicUrl = 'https://86c9f3996aaa74.lhr.life';
  const tunnelFile = path.join(__dirname, 'data', 'tunnel.json');
  try {
    if (fs.existsSync(tunnelFile)) {
      const data = JSON.parse(fs.readFileSync(tunnelFile, 'utf-8'));
      if (data.url) publicUrl = data.url;
    }
  } catch {}

  res.json({
    publicUrl,
    wifiUrl: 'http://172.20.35.121:5173',
  });
});

app.post('/api/tunnel-info', (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (url && typeof url === 'string') {
      const tunnelFile = path.join(__dirname, 'data', 'tunnel.json');
      fs.writeFileSync(tunnelFile, JSON.stringify({ url: url.trim(), updatedAt: new Date().toISOString() }, null, 2), 'utf-8');
      return res.json({ success: true, message: 'Tunnel URL updated', url: url.trim() });
    }
    res.status(400).json({ success: false, error: 'Invalid URL provided' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AUTHENTICATION & USER APIS ---

const usersFile = path.join(__dirname, 'data', 'users.json');

function getUsers(): any[] {
  try {
    if (fs.existsSync(usersFile)) {
      return JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    }
  } catch (err) {
    console.error('Error reading users.json:', err);
  }
  return [];
}

function saveUsers(users: any[]): void {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users.json:', err);
  }
}

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, role, brand } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const users = getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password, // In real production we would bcrypt.hash
      role: role === 'designer' || role === 'admin' ? role : 'shopper',
      brand: brand || (role === 'designer' ? 'Apex Wear' : undefined),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const { password: _, ...userProfile } = newUser;
    const token = `token-${newUser.id}-${Date.now()}`;

    res.status(201).json({
      success: true,
      data: { user: userProfile, token },
      message: 'Account registered successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const { password: _, ...userProfile } = user;
    const token = `token-${user.id}-${Date.now()}`;

    res.json({
      success: true,
      data: { user: userProfile, token },
      message: 'Logged in successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 1-Click Demo Login for Hackathon Judges
app.post('/api/auth/demo-login', (req: Request, res: Response) => {
  try {
    const { role } = req.body; // 'shopper' | 'designer' | 'admin'
    const users = getUsers();

    let targetEmail = 'sarah.designer@fitpulse.ai';
    if (role === 'shopper') targetEmail = 'alex.shopper@fitpulse.ai';
    if (role === 'admin') targetEmail = 'admin@fitpulse.ai';

    let user = users.find((u) => u.email.toLowerCase() === targetEmail);
    if (!user) {
      user = users.find((u) => u.role === role) || users[0];
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'Demo user not found' });
    }

    const { password: _, ...userProfile } = user;
    const token = `token-${user.id}-${Date.now()}`;

    res.json({
      success: true,
      data: { user: userProfile, token },
      message: `Signed in as ${user.name} (${user.role})`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Current User Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No authorization token provided' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const parts = token.split('-');
    if (parts.length < 3 || parts[0] !== 'token') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const userId = `${parts[1]}-${parts[2]}`; // e.g. usr-shopper-001 or usr-12345
    const users = getUsers();
    const user = users.find((u) => u.id === userId || token.includes(u.id));

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { password: _, ...userProfile } = user;
    res.json({ success: true, data: userProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Logout
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Update Sizing Profile
app.put('/api/auth/profile/sizing', (req: Request, res: Response) => {
  try {
    const { userId, sizingProfile } = req.body;
    if (!userId || !sizingProfile) {
      return res.status(400).json({ success: false, error: 'userId and sizingProfile are required' });
    }

    const users = getUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    users[userIndex].sizingProfile = sizingProfile;
    saveUsers(users);

    const { password: _, ...userProfile } = users[userIndex];
    res.json({ success: true, data: userProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- PARTICIPANT QR & SESSION APIS ---

// List all sessions
app.get('/api/sessions', (_req: Request, res: Response) => {
  const sessions = sessionDb.getAll();
  const feedbacks = participantFeedbackDb.getAll();
  const participants = participantDb.getAll();

  const enriched = sessions.map((s) => ({
    ...s,
    totalParticipants: participants.filter((p) => p.sessionId === s.id).length,
    totalSubmissions: feedbacks.filter((f) => f.sessionId === s.id).length,
  }));

  res.json({ success: true, data: enriched });
});

// Generate a new QR participant session
app.post('/api/sessions/generate', (req: Request, res: Response) => {
  try {
    const { name, durationHours } = req.body;
    const session = sessionDb.createSession(name || 'Hackathon Session', durationHours || 6);
    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Validate session token for scanning participants
app.get('/api/sessions/:token', (req: Request, res: Response) => {
  const result = sessionDb.getByToken(req.params.token);
  if (!result.isValid) {
    return res.status(200).json({
      success: false,
      isValid: false,
      error: result.error || 'Invalid',
      session: result.session,
    });
  }

  res.json({
    success: true,
    isValid: true,
    data: result.session,
  });
});

// Update session status (active, paused, ended)
app.patch('/api/sessions/:token/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body as { status: SessionStatus };
    if (!['active', 'paused', 'ended'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const updated = sessionDb.updateStatus(req.params.token, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Session live participation stats
app.get('/api/sessions/:token/stats', (req: Request, res: Response) => {
  const check = sessionDb.getByToken(req.params.token);
  if (!check.session) {
    return res.status(404).json({ success: false, error: 'Session not found' });
  }

  const s = check.session;
  const participants = participantDb.getAll().filter((p) => p.sessionId === s.id);
  const feedbacks = participantFeedbackDb.getAll().filter((f) => f.sessionId === s.id);
  const analyses = analysisDb.getAll().filter((a) => a.sessionId === s.id);

  res.json({
    success: true,
    data: {
      session: s,
      activeParticipants: participants.length,
      completedAnalyses: analyses.length,
      totalSubmissions: feedbacks.length,
    },
  });
});

// --- PARTICIPANT MOBILE EXPERIENCE APIS ---

// Step 2 & 3: Validate uploaded photo quality
app.post('/api/participant/validate-photo', upload.single('photo'), (req: Request, res: Response) => {
  try {
    let fileInfo = {
      size: 450 * 1024,
      mimetype: 'image/jpeg',
      originalname: 'demo-capture.jpg',
    };

    let imageUrl: string | undefined = undefined;

    if (req.file) {
      fileInfo = {
        size: req.file.size,
        mimetype: req.file.mimetype,
        originalname: req.file.originalname,
      };
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const report = validateImageQuality(fileInfo);

    res.json({
      success: true,
      data: {
        photoQuality: report,
        imageUrl,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Step 4, 5, 6: AI Body Proportions & Explainable Size Recommendation
app.post('/api/participant/analyze-fit', (req: Request, res: Response) => {
  try {
    const {
      sessionId,
      height,
      weight,
      garmentType = 'Shirt',
      fitPreference = 'Regular',
      consentGiven = true,
      photoQuality,
      imageUrl,
    } = req.body;

    const safeHeight = Number(height) || 175;
    const safeWeight = weight ? Number(weight) : undefined;

    // 1. Create anonymous participant record
    const participant = participantDb.insert({
      sessionId,
      height: safeHeight,
      weight: safeWeight,
      garmentType: garmentType as GarmentType,
      fitPreference: fitPreference as FitPreference,
      consentGiven: Boolean(consentGiven),
    });

    // 2. Estimate body proportions
    const measurements = estimateBodyProportions(
      safeHeight,
      safeWeight,
      garmentType as GarmentType,
      fitPreference as FitPreference
    );

    // 3. Recommend size
    const recommendation = recommendSize(
      measurements,
      safeHeight,
      safeWeight,
      garmentType as GarmentType,
      fitPreference as FitPreference,
      photoQuality
    );

    // 4. Save analysis
    analysisDb.insert({
      participantId: participant.id,
      sessionId,
      photoQuality: recommendation.photoQuality,
      measurements,
      recommendation,
      imageUrl,
    });

    res.json({
      success: true,
      data: {
        participantId: participant.id,
        measurements,
        recommendation,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Step 7: Submit actual fit feedback & cross-evaluate recommendation accuracy
app.post('/api/participant/feedback', async (req: Request, res: Response) => {
  try {
    const {
      participantId,
      sessionId,
      garmentType = 'Shirt',
      recommendedSize = 'M',
      actualSize = 'M',
      fitRating = 'Perfect',
      problemAreas = [],
      comment = '',
    } = req.body;

    const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const recIdx = SIZES.indexOf(recommendedSize as Size);
    const actIdx = SIZES.indexOf(actualSize as Size);
    const sizeDifference = recIdx !== -1 && actIdx !== -1 ? Math.abs(recIdx - actIdx) : 0;
    const isCorrectSize = sizeDifference === 0;

    // Natural Language Processing of participant text comments
    const aiAnalysis = await analyzeFeedback(comment, {
      garmentType: garmentType as GarmentType,
      size: actualSize as Size,
      rating: fitRating === 'Perfect' ? 5 : fitRating.includes('Slightly') ? 3 : 1,
      structuredBodyAreas: (problemAreas as string[]).map((p) => ({
        area: p as any,
        issue: fitRating.includes('Tight') ? 'Too Tight' : fitRating.includes('Loose') ? 'Too Loose' : 'Fits Correctly',
      })),
    });

    // Save to participant feedback collection
    const participantFb = participantFeedbackDb.insert({
      participantId: participantId || `part-${Date.now()}`,
      sessionId,
      garmentType: garmentType as GarmentType,
      recommendedSize: recommendedSize as Size,
      actualSize: actualSize as Size,
      fitRating,
      problemAreas: Array.isArray(problemAreas) ? problemAreas : [],
      comment,
      sentiment: aiAnalysis.sentiment,
      severity: aiAnalysis.severity,
      sizeDifference,
      isCorrectSize,
    });

    // Also sync to master brand feedback DB so existing charts and heatmaps update in real-time
    db.insert({
      id: `fb-live-${Date.now()}`,
      timestamp: new Date().toISOString(),
      brand: 'Participant Live Test',
      product: `${garmentType} (Crowd Fit)`,
      garmentType: garmentType as GarmentType,
      category: 'Participant Sizing',
      size: actualSize as Size,
      expectedSize: recommendedSize as Size,
      fitPreference: 'Regular',
      bodyAreas: (problemAreas as string[]).map((a) => ({
        area: a as any,
        issue: fitRating.includes('Tight') ? 'Too Tight' : fitRating.includes('Loose') ? 'Too Loose' : 'Other',
      })),
      overallRating: fitRating === 'Perfect' ? 5 : fitRating.includes('Slightly') ? 3 : 2,
      comfortRating: fitRating === 'Perfect' ? 5 : 3,
      sizeAccuracyRating: isCorrectSize ? 5 : 2,
      comment: comment || `Tried size ${actualSize} (AI recommended ${recommendedSize}). Fit was ${fitRating.toLowerCase()}.`,
      returnReason: fitRating === 'Perfect' ? 'No return' : 'Size issue',
      aiAnalysis,
    });

    res.status(201).json({
      success: true,
      message: 'Participant fit feedback recorded and verified',
      data: participantFb,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- ORGANIZER ADMIN INTELLIGENCE APIS ---

// Recommendation Accuracy and size difference metrics
app.get('/api/admin/accuracy-metrics', (_req: Request, res: Response) => {
  try {
    const feedbacks = participantFeedbackDb.getAll();
    const metrics = computeRecommendationAccuracy(feedbacks);
    res.json({ success: true, data: metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Dynamic Brand Insights derived from participant sizing feedback
app.get('/api/admin/brand-insights', (_req: Request, res: Response) => {
  try {
    const feedbacks = participantFeedbackDb.getAll();
    const insights = generateBrandInsightsFromData(feedbacks);
    res.json({ success: true, data: insights });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Recent participant analyses stream for admin dashboard
app.get('/api/admin/participants', (_req: Request, res: Response) => {
  try {
    const participants = participantDb.getAll();
    const analyses = analysisDb.getAll();
    const feedbacks = participantFeedbackDb.getAll();

    const merged = participants.slice(0, 30).map((p) => {
      const analysis = analyses.find((a) => a.participantId === p.id);
      const feedback = feedbacks.find((f) => f.participantId === p.id);
      return {
        participant: p,
        analysis,
        feedback,
      };
    });

    res.json({ success: true, data: merged });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get feedback with filters
app.get('/api/feedback', (req: Request, res: Response) => {
  try {
    const params: FilterParams = {
      search: req.query.search as string,
      brand: req.query.brand as string,
      garmentType: req.query.garmentType as string,
      size: req.query.size as string,
      bodyArea: req.query.bodyArea as string,
      issueType: req.query.issueType as string,
      fitPreference: req.query.fitPreference as string,
      returnReason: req.query.returnReason as string,
      sentiment: req.query.sentiment as string,
      severity: req.query.severity as string,
      minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
      maxRating: req.query.maxRating ? Number(req.query.maxRating) : undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const records = db.filter(params);
    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single feedback by id
app.get('/api/feedback/:id', (req: Request, res: Response) => {
  const record = db.getById(req.params.id);
  if (!record) {
    return res.status(404).json({ success: false, error: 'Feedback record not found' });
  }
  res.json({ success: true, data: record });
});

// Submit customer feedback (Accepts JSON or multipart/form-data)
app.post('/api/feedback', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Parse bodyAreas if sent as JSON string
    let parsedBodyAreas = body.bodyAreas;
    if (typeof parsedBodyAreas === 'string') {
      try {
        parsedBodyAreas = JSON.parse(parsedBodyAreas);
      } catch {
        parsedBodyAreas = [];
      }
    }
    if (!Array.isArray(parsedBodyAreas)) {
      parsedBodyAreas = [];
    }

    const brand = body.brand || 'Aura Atelier';
    const product = body.product || 'Custom Garment';
    const garmentType = body.garmentType || 'Shirt';
    const category = body.category || 'Apparel';
    const size = body.size || 'M';
    const expectedSize = body.expectedSize || size;
    const fitPreference = body.fitPreference || 'Regular';
    const overallRating = Number(body.overallRating) || 3;
    const comfortRating = Number(body.comfortRating) || overallRating;
    const sizeAccuracyRating = Number(body.sizeAccuracyRating) || overallRating;
    const comment = body.comment || '';
    const returnReason = body.returnReason || 'No return';

    let imageUrl: string | undefined = undefined;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (body.imageUrl) {
      imageUrl = body.imageUrl;
    }

    // Run AI / NLP Analysis
    const aiAnalysis = await analyzeFeedback(comment, {
      garmentType,
      size,
      fitPreference,
      returnReason,
      rating: overallRating,
      structuredBodyAreas: parsedBodyAreas,
    });

    // Construct full feedback item
    const newFeedback: Feedback = {
      id: `fb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      brand,
      product,
      garmentType,
      category,
      size,
      expectedSize,
      fitPreference,
      bodyAreas: parsedBodyAreas.length > 0 ? parsedBodyAreas : aiAnalysis.fitIssues.map((f) => ({ area: f.area as any, issue: f.issue as any })),
      overallRating,
      comfortRating,
      sizeAccuracyRating,
      comment,
      returnReason,
      imageUrl,
      aiAnalysis,
    };

    const saved = db.insert(newFeedback);

    res.status(201).json({
      success: true,
      message: 'Feedback processed and categorized successfully',
      data: saved,
    });
  } catch (err: any) {
    console.error('Error processing feedback:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

// Analytics endpoint
app.get('/api/analytics', (req: Request, res: Response) => {
  try {
    const brand = req.query.brand as string;
    const garmentType = req.query.garmentType as string;

    let feedbacks = db.getAll();
    if (brand) {
      feedbacks = feedbacks.filter((f) => f.brand.toLowerCase() === brand.toLowerCase());
    }
    if (garmentType) {
      feedbacks = feedbacks.filter((f) => f.garmentType.toLowerCase() === garmentType.toLowerCase());
    }

    const metrics = computeAnalytics(feedbacks);
    res.json({ success: true, data: metrics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Size-specific dynamic comparative analysis
app.get('/api/size-analysis', (req: Request, res: Response) => {
  try {
    const garment = (req.query.garment as string) || 'Shirt';
    const size = (req.query.size as string) || 'M';

    const feedbacks = db.getAll();
    const analysis = computeSizeSpecificAnalysis(feedbacks, garment, size);

    res.json({ success: true, data: analysis });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Body Area Heatmap
app.get('/api/heatmap', (req: Request, res: Response) => {
  try {
    const garment = req.query.garment as string;
    const feedbacks = db.getAll();
    const heatmap = computeHeatmap(feedbacks, garment);

    res.json({ success: true, data: heatmap });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Actionable Design Recommendations
app.get('/api/recommendations', (_req: Request, res: Response) => {
  try {
    const feedbacks = db.getAll();
    const recommendations = generateRecommendations(feedbacks);
    res.json({ success: true, data: recommendations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Designer Action Plan & Tech Pack Specs
app.get('/api/designer-action-plan', (_req: Request, res: Response) => {
  try {
    const feedbacks = db.getAll();
    const actionPlan = generateDesignerActionPlan(feedbacks);
    res.json({ success: true, data: actionPlan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Demo controls: Reset
app.post('/api/demo/reset', (_req: Request, res: Response) => {
  try {
    const resetData = db.resetDemoData();
    res.json({
      success: true,
      message: 'Demo dataset successfully reset with 175 realistic fashion fit records',
      count: resetData.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Demo controls: Clear
app.post('/api/demo/clear', (_req: Request, res: Response) => {
  try {
    db.clearAll();
    res.json({
      success: true,
      message: 'All feedback records cleared',
      count: 0,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export CSV
app.get('/api/export/csv', (_req: Request, res: Response) => {
  try {
    const feedbacks = db.getAll();
    const headers = [
      'ID',
      'Date',
      'Brand',
      'Product',
      'Garment',
      'Category',
      'Size',
      'ExpectedSize',
      'FitPreference',
      'OverallRating',
      'ComfortRating',
      'SizeAccuracyRating',
      'ReturnReason',
      'Sentiment',
      'Severity',
      'BodyAreas',
      'Comment',
    ];

    const rows = feedbacks.map((f) => [
      f.id,
      f.timestamp.slice(0, 10),
      `"${f.brand.replace(/"/g, '""')}"`,
      `"${f.product.replace(/"/g, '""')}"`,
      f.garmentType,
      f.category,
      f.size,
      f.expectedSize,
      f.fitPreference,
      f.overallRating,
      f.comfortRating,
      f.sizeAccuracyRating,
      `"${f.returnReason}"`,
      f.aiAnalysis.sentiment,
      f.aiAnalysis.severity,
      `"${f.bodyAreas.map((b) => `${b.area}:${b.issue}`).join(';')}"`,
      `"${(f.comment || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="clothing-fit-feedback.csv"');
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export Summary Report
app.get('/api/export/summary', (_req: Request, res: Response) => {
  try {
    const feedbacks = db.getAll();
    const analytics = computeAnalytics(feedbacks);
    const recommendations = generateRecommendations(feedbacks);
    const actionPlan = generateDesignerActionPlan(feedbacks);

    res.json({
      reportTitle: 'Fashion Fit Intelligence Executive Summary',
      generatedAt: new Date().toISOString(),
      hackathonTrack: 'Fashion for People',
      metrics: analytics,
      recommendations,
      designerActionPlan: actionPlan,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Clothing Fit Intelligence Server running on http://localhost:${PORT}`);
});
