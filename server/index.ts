import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { db } from './db';
import { analyzeFeedback } from './nlpEngine';
import { computeAnalytics, computeSizeSpecificAnalysis, computeHeatmap } from './analyticsEngine';
import { generateRecommendations, generateDesignerActionPlan } from './recommendationEngine';
import { Feedback, FilterParams } from './types';

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
