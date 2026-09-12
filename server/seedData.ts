import { Feedback, GarmentType, Size, FitPreference, BodyArea, FitIssueType, ReturnReason, Sentiment, Severity } from './types';

interface SeedTemplate {
  brand: string;
  product: string;
  garmentType: GarmentType;
  category: string;
  size: Size;
  expectedSize: Size;
  fitPreference: FitPreference;
  bodyAreas: { area: BodyArea; issue: FitIssueType }[];
  overallRating: number;
  comfortRating: number;
  sizeAccuracyRating: number;
  comment: string;
  returnReason: ReturnReason;
  positiveAreas: string[];
  sentiment: Sentiment;
  severity: Severity;
}

const BRANDS = ['Aura Atelier', 'Verve Denim', 'Nordik Studio', 'Urban Stitch', 'Silk & Stone'];

// Realistic templates demonstrating meaningful fashion fit patterns
const SEED_TEMPLATES: SeedTemplate[] = [
  // Shirt - M - Tight Shoulders (High frequency pattern!)
  {
    brand: 'Aura Atelier',
    product: 'Oxford Slim Button-Down',
    garmentType: 'Shirt',
    category: 'Formalwear',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Slim',
    bodyAreas: [{ area: 'Shoulders', issue: 'Too Tight' }, { area: 'Arms', issue: 'Too Tight' }],
    overallRating: 2,
    comfortRating: 2,
    sizeAccuracyRating: 3,
    comment: 'The shirt looks gorgeous and the chest fits fine, but the shoulders are severely tight whenever I reach forward. The deltoid seam pinches.',
    returnReason: 'Fit issue',
    positiveAreas: ['Chest', 'Length'],
    sentiment: 'Negative',
    severity: 'High',
  },
  {
    brand: 'Nordik Studio',
    product: 'Linen Vacation Shirt',
    garmentType: 'Shirt',
    category: 'Casual',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Shoulders', issue: 'Too Tight' }, { area: 'Sleeves', issue: 'Too Short' }],
    overallRating: 2,
    comfortRating: 3,
    sizeAccuracyRating: 2,
    comment: 'Fabric is lovely and light, but the shoulders are tight across the back. Sleeves are also shorter than normal by about an inch.',
    returnReason: 'Fit issue',
    positiveAreas: ['Waist'],
    sentiment: 'Negative',
    severity: 'Medium',
  },
  {
    brand: 'Urban Stitch',
    product: 'Classic Poplin Shirt',
    garmentType: 'Shirt',
    category: 'Formalwear',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Shoulders', issue: 'Too Tight' }],
    overallRating: 3,
    comfortRating: 2,
    sizeAccuracyRating: 3,
    comment: 'Nice collar and waist taper, but tightness across shoulders restricts arm movement at my desk.',
    returnReason: 'No return',
    positiveAreas: ['Waist', 'Neck'],
    sentiment: 'Neutral',
    severity: 'Medium',
  },
  {
    brand: 'Aura Atelier',
    product: 'Chambray Everyday Shirt',
    garmentType: 'Shirt',
    category: 'Casual',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Shoulders', issue: 'Too Tight' }],
    overallRating: 2,
    comfortRating: 2,
    sizeAccuracyRating: 2,
    comment: 'Shoulders are tight and pull awkwardly when buttoned all the way down. Going to return for an L.',
    returnReason: 'Size issue',
    positiveAreas: [],
    sentiment: 'Negative',
    severity: 'High',
  },
  {
    brand: 'Nordik Studio',
    product: 'Oxford Slim Button-Down',
    garmentType: 'Shirt',
    category: 'Formalwear',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Slim',
    bodyAreas: [{ area: 'Shoulders', issue: 'Too Tight' }, { area: 'Chest', issue: 'Fits Correctly' }],
    overallRating: 3,
    comfortRating: 3,
    sizeAccuracyRating: 3,
    comment: 'Chest and torso are spot on slim, but shoulders need at least 1.5 cm extra width.',
    returnReason: 'No return',
    positiveAreas: ['Chest'],
    sentiment: 'Neutral',
    severity: 'Medium',
  },

  // Shirt - L - Loose Waist pattern
  {
    brand: 'Urban Stitch',
    product: 'Classic Poplin Shirt',
    garmentType: 'Shirt',
    category: 'Formalwear',
    size: 'L',
    expectedSize: 'L',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Waist', issue: 'Too Loose' }, { area: 'Shoulders', issue: 'Fits Correctly' }],
    overallRating: 3,
    comfortRating: 4,
    sizeAccuracyRating: 3,
    comment: 'Shoulders and chest fit well, but there is way too much loose fabric billowing around the waist and lower back.',
    returnReason: 'Fit issue',
    positiveAreas: ['Shoulders', 'Chest'],
    sentiment: 'Neutral',
    severity: 'Medium',
  },
  {
    brand: 'Aura Atelier',
    product: 'Tailored Cotton Shirt',
    garmentType: 'Shirt',
    category: 'Formalwear',
    size: 'L',
    expectedSize: 'L',
    fitPreference: 'Slim',
    bodyAreas: [{ area: 'Waist', issue: 'Too Loose' }],
    overallRating: 3,
    comfortRating: 4,
    sizeAccuracyRating: 3,
    comment: 'Supposed to be slim fit, but the waist is baggy like a regular cut. Needs more waist tapering.',
    returnReason: 'No return',
    positiveAreas: ['Shoulders', 'Sleeves'],
    sentiment: 'Neutral',
    severity: 'Low',
  },

  // Jeans - M - Tight Thighs & Rise issues
  {
    brand: 'Verve Denim',
    product: 'Raw Selvedge Slim Jeans',
    garmentType: 'Jeans',
    category: 'Denim',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Slim',
    bodyAreas: [{ area: 'Thighs', issue: 'Too Tight' }, { area: 'Rise', issue: 'Too Tight' }],
    overallRating: 2,
    comfortRating: 1,
    sizeAccuracyRating: 2,
    comment: 'Waist fits fine but thighs are constricting like compression tights. Front rise is uncomfortably low and digs in.',
    returnReason: 'Fit issue',
    positiveAreas: ['Waist'],
    sentiment: 'Negative',
    severity: 'High',
  },
  {
    brand: 'Verve Denim',
    product: 'Vintage Straight Leg Jeans',
    garmentType: 'Jeans',
    category: 'Denim',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Thighs', issue: 'Too Tight' }],
    overallRating: 3,
    comfortRating: 2,
    sizeAccuracyRating: 3,
    comment: 'Thighs are tighter than typical straight cut. Hard to bend down or sit comfortably for long periods.',
    returnReason: 'No return',
    positiveAreas: ['Length', 'Waist'],
    sentiment: 'Neutral',
    severity: 'Medium',
  },

  // Jeans - L - Loose Waist pattern
  {
    brand: 'Verve Denim',
    product: 'Comfort Stretch Tapered Jeans',
    garmentType: 'Jeans',
    category: 'Denim',
    size: 'L',
    expectedSize: 'L',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Waist', issue: 'Too Loose' }, { area: 'Hips', issue: 'Fits Correctly' }],
    overallRating: 3,
    comfortRating: 4,
    sizeAccuracyRating: 3,
    comment: 'Great leg room and stretch, but waist gaps by 2 inches in the back when sitting.',
    returnReason: 'No return',
    positiveAreas: ['Thighs', 'Length'],
    sentiment: 'Neutral',
    severity: 'Medium',
  },

  // Dress - S - Tight Chest
  {
    brand: 'Silk & Stone',
    product: 'Floral Midi Wrap Dress',
    garmentType: 'Dress',
    category: 'Womenswear',
    size: 'S',
    expectedSize: 'S',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Chest', issue: 'Too Tight' }, { area: 'Waist', issue: 'Fits Correctly' }],
    overallRating: 2,
    comfortRating: 2,
    sizeAccuracyRating: 2,
    comment: 'Flattering silhouette at waist and hips, but the bust area is very tight and pulls open between buttons.',
    returnReason: 'Fit issue',
    positiveAreas: ['Waist', 'Hips'],
    sentiment: 'Negative',
    severity: 'High',
  },
  {
    brand: 'Aura Atelier',
    product: 'Pleated Slip Dress',
    garmentType: 'Dress',
    category: 'Womenswear',
    size: 'S',
    expectedSize: 'S',
    fitPreference: 'Slim',
    bodyAreas: [{ area: 'Chest', issue: 'Too Tight' }],
    overallRating: 2,
    comfortRating: 2,
    sizeAccuracyRating: 2,
    comment: 'Chest is suffocatingly snug for a size Small. Can barely zip it up past the ribcage.',
    returnReason: 'Return reason',
    positiveAreas: ['Length'],
    sentiment: 'Negative',
    severity: 'High',
  },

  // Dress - M - Incorrect Length
  {
    brand: 'Silk & Stone',
    product: 'Satin Column Maxi Dress',
    garmentType: 'Dress',
    category: 'Womenswear',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Length', issue: 'Too Long' }],
    overallRating: 3,
    comfortRating: 4,
    sizeAccuracyRating: 3,
    comment: 'Beautiful drape, but the hem drags on the floor even with 3-inch heels. Needs petite length options.',
    returnReason: 'Fit issue',
    positiveAreas: ['Waist', 'Chest'],
    sentiment: 'Neutral',
    severity: 'Medium',
  },

  // T-Shirt - M - Short Sleeves
  {
    brand: 'Nordik Studio',
    product: 'Heavyweight Boxy Tee',
    garmentType: 'T-Shirt',
    category: 'Basics',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Sleeves', issue: 'Too Short' }],
    overallRating: 3,
    comfortRating: 4,
    sizeAccuracyRating: 3,
    comment: 'Chest and body length are great, but the sleeves are noticeably short and ride into my armpits when moving.',
    returnReason: 'No return',
    positiveAreas: ['Chest', 'Length'],
    sentiment: 'Neutral',
    severity: 'Medium',
  },
  {
    brand: 'Urban Stitch',
    product: 'Premium Crew Neck T-Shirt',
    garmentType: 'T-Shirt',
    category: 'Basics',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Sleeves', issue: 'Too Short' }, { area: 'Shoulders', issue: 'Fits Correctly' }],
    overallRating: 3,
    comfortRating: 3,
    sizeAccuracyRating: 3,
    comment: 'Fabric feels premium, but sleeves look cropped on an average build. Needs about 2 cm more sleeve drop.',
    returnReason: 'No return',
    positiveAreas: ['Chest', 'Waist'],
    sentiment: 'Neutral',
    severity: 'Low',
  },

  // Jacket - L - Tight Shoulders & Short Arms
  {
    brand: 'Nordik Studio',
    product: 'Minimalist Wool Overcoat',
    garmentType: 'Jacket',
    category: 'Outerwear',
    size: 'L',
    expectedSize: 'L',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Shoulders', issue: 'Too Tight' }, { area: 'Arms', issue: 'Too Tight' }],
    overallRating: 2,
    comfortRating: 2,
    sizeAccuracyRating: 2,
    comment: 'Cannot layer a sweater underneath because armholes and shoulders are cut too tight. Beautiful coat otherwise.',
    returnReason: 'Fit issue',
    positiveAreas: ['Length', 'Waist'],
    sentiment: 'Negative',
    severity: 'High',
  },

  // Perfect Fits / Positive Feedback
  {
    brand: 'Aura Atelier',
    product: 'Everyday Relaxed Tee',
    garmentType: 'T-Shirt',
    category: 'Basics',
    size: 'L',
    expectedSize: 'L',
    fitPreference: 'Relaxed',
    bodyAreas: [{ area: 'Chest', issue: 'Fits Correctly' }, { area: 'Waist', issue: 'Fits Correctly' }],
    overallRating: 5,
    comfortRating: 5,
    sizeAccuracyRating: 5,
    comment: 'Fits true to size! Flattering drape around the chest and comfortable collar. Will definitely order more colors.',
    returnReason: 'No return',
    positiveAreas: ['Chest', 'Waist', 'Length'],
    sentiment: 'Positive',
    severity: 'Low',
  },
  {
    brand: 'Urban Stitch',
    product: 'Pleated Everyday Trousers',
    garmentType: 'Trousers',
    category: 'Bottoms',
    size: 'M',
    expectedSize: 'M',
    fitPreference: 'Relaxed',
    bodyAreas: [{ area: 'Waist', issue: 'Fits Correctly' }, { area: 'Length', issue: 'Fits Correctly' }],
    overallRating: 5,
    comfortRating: 5,
    sizeAccuracyRating: 5,
    comment: 'Best fitting trousers I have bought all year. Perfect waist drape and ideal break at the shoe.',
    returnReason: 'No return',
    positiveAreas: ['Waist', 'Length', 'Hips'],
    sentiment: 'Positive',
    severity: 'Low',
  },
  {
    brand: 'Silk & Stone',
    product: 'Traditional Linen Kurta',
    garmentType: 'Kurta',
    category: 'Ethnic Wear',
    size: 'L',
    expectedSize: 'L',
    fitPreference: 'Regular',
    bodyAreas: [{ area: 'Chest', issue: 'Fits Correctly' }, { area: 'Length', issue: 'Fits Correctly' }],
    overallRating: 5,
    comfortRating: 5,
    sizeAccuracyRating: 5,
    comment: 'Excellent stitching, comfortable armholes, and perfect calf length. Extremely comfortable in warm weather.',
    returnReason: 'No return',
    positiveAreas: ['Chest', 'Length', 'Shoulders'],
    sentiment: 'Positive',
    severity: 'Low',
  },
];

/**
 * Generate 175 realistic feedback records with realistic distributions
 */
export function generateSeedData(): Feedback[] {
  const records: Feedback[] = [];
  const total = 175;
  const now = Date.now();

  for (let i = 0; i < total; i++) {
    // Pick base template
    const templateIndex = i % SEED_TEMPLATES.length;
    const template = SEED_TEMPLATES[templateIndex];

    // Timestamp distributed over the last 45 days
    const daysAgo = Math.floor((i / total) * 45) + (i % 3);
    const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000 - (i % 24) * 3600 * 1000).toISOString();

    // Minor variations on brand and rating
    const brand = template.brand || BRANDS[i % BRANDS.length];
    const ratingVariance = (i % 3) === 0 ? 0 : (i % 3 === 1 ? 1 : -1);
    const overallRating = Math.max(1, Math.min(5, template.overallRating + ratingVariance));
    const comfortRating = Math.max(1, Math.min(5, template.comfortRating + (i % 2 === 0 ? 0 : -1)));
    const sizeAccuracyRating = Math.max(1, Math.min(5, template.sizeAccuracyRating + (overallRating >= 4 ? 1 : 0)));

    const record: Feedback = {
      id: `fb-${1000 + i}`,
      timestamp,
      brand,
      product: template.product,
      garmentType: template.garmentType,
      category: template.category,
      size: template.size,
      expectedSize: template.expectedSize,
      fitPreference: template.fitPreference,
      bodyAreas: template.bodyAreas,
      overallRating,
      comfortRating,
      sizeAccuracyRating,
      comment: template.comment,
      returnReason: overallRating <= 2 ? 'Fit issue' : template.returnReason,
      imageUrl: i % 12 === 0 ? 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=60' : undefined,
      aiAnalysis: {
        fitIssues: template.bodyAreas.filter((b) => b.issue !== 'Fits Correctly'),
        positiveAreas: template.positiveAreas,
        fitPreference: template.fitPreference,
        sentiment: overallRating >= 4 ? 'Positive' : overallRating === 3 ? 'Neutral' : 'Negative',
        severity: overallRating <= 2 ? 'High' : overallRating === 3 ? 'Medium' : 'Low',
        returnReason: overallRating <= 2 ? 'Fit issue' : template.returnReason,
        aiSummary: `AI parsed ${template.bodyAreas.length} area(s). Predominant issue: ${template.bodyAreas[0]?.issue || 'Normal fit'}.`,
        engineUsed: 'Rule-based-NLP',
      },
    };

    records.push(record);
  }

  return records;
}
