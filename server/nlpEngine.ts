import { AiAnalysisResult, AiExtractedIssue, BodyArea, FitIssueType, Sentiment, Severity, FitPreference, ReturnReason } from './types';

// Area synonym dictionary
const AREA_PATTERNS: { area: BodyArea; regex: RegExp }[] = [
  { area: 'Shoulders', regex: /\b(shoulder|shoulders|deltoid|across the shoulder)\b/i },
  { area: 'Chest', regex: /\b(chest|bust|bustline|boobs|pecs|pec|across the chest|ribcage)\b/i },
  { area: 'Waist', regex: /\b(waist|waistband|midriff|belly|stomach|tummy|midsection)\b/i },
  { area: 'Hips', regex: /\b(hip|hips|pelvis|rear|glutes|butt|buttocks)\b/i },
  { area: 'Sleeves', regex: /\b(sleeve|sleeves|cuff|cuffs|arm length|wrist|forearm)\b/i },
  { area: 'Length', regex: /\b(length|hem|hemline|overall length|tall|torso length|body length)\b/i },
  { area: 'Neck', regex: /\b(neck|collar|neckline|throat|choker)\b/i },
  { area: 'Arms', regex: /\b(arm|arms|armhole|armpit|underarm|bicep|biceps)\b/i },
  { area: 'Thighs', regex: /\b(thigh|thighs|quad|quads|upper leg)\b/i },
  { area: 'Rise', regex: /\b(rise|crotch|inseam|gusset|wedgie|front rise|back rise)\b/i },
];

// Fit issue synonym dictionary
const ISSUE_PATTERNS: { issue: FitIssueType; regex: RegExp }[] = [
  {
    issue: 'Too Tight',
    regex: /\b(tight|tightly|small|smaller|pinching|pinched|restricting|restrictive|suffocating|squeezing|constricting|binding|digging|digs in|cuts into|snug|can't breathe|burst|bursting)\b/i,
  },
  {
    issue: 'Too Loose',
    regex: /\b(loose|loosely|baggy|oversized|large|huge|swimming|wide|gaps|gapping|gap|sagging|drooping|billowy|swallows me|roomy)\b/i,
  },
  {
    issue: 'Too Short',
    regex: /\b(short|shorter|doesn't reach|cropped|high-water|rides up|barely covers|too little length)\b/i,
  },
  {
    issue: 'Too Long',
    regex: /\b(long|longer|dragging|extra length|puddling|bunched up|bunching|sweeping|too much length)\b/i,
  },
  {
    issue: 'Fits Correctly',
    regex: /\b(fits nicely|fits well|fits great|fits perfect|perfect|spot on|great fit|good fit|comfortable|just right|flattering)\b/i,
  },
];

const POSITIVE_WORDS = /\b(nice|nicely|great|perfect|good|fine|love|flattering|comfortable|well|amazing|okay|acceptable)\b/i;
const NEGATIVE_WORDS = /\b(terrible|awful|unwearable|tight|poor|bad|choking|painful|uncomfortable|disappointed|wrong|loose|short|long)\b/i;
const HIGH_SEVERITY_WORDS = /\b(unwearable|extremely|terrible|cannot wear|bursting|choking|painful|horrible|impossible)\b/i;
const LOW_SEVERITY_WORDS = /\b(slightly|a bit|a little|minor|barely|somewhat|tolerable)\b/i;

/**
 * Fallback Rule-Based NLP Engine
 * High reliability, zero-latency, works completely offline
 */
export function analyzeWithRuleEngine(
  text: string,
  context?: {
    garmentType?: string;
    size?: string;
    fitPreference?: string;
    returnReason?: string;
    rating?: number;
    structuredBodyAreas?: { area: BodyArea; issue: FitIssueType }[];
  }
): AiAnalysisResult {
  const normalized = (text || '').trim();
  const fitIssues: AiExtractedIssue[] = [];
  const positiveAreas: string[] = [];

  if (!normalized && context?.structuredBodyAreas?.length) {
    // If text is empty but user picked structured areas
    for (const item of context.structuredBodyAreas) {
      if (item.issue === 'Fits Correctly') {
        positiveAreas.push(item.area);
      } else {
        fitIssues.push({ area: item.area, issue: item.issue });
      }
    }
  }

  // Split text into clauses/sentences by punctuation and conjunctions
  const clauses = normalized.split(/[.,;!?]|\b(?:but|however|although|though|except|while|and|also|plus|as well as)\b/i);

  for (const clause of clauses) {
    const trimmed = clause.trim();
    if (!trimmed) continue;

    // Check all areas that appear in this clause
    for (const ap of AREA_PATTERNS) {
      if (ap.regex.test(trimmed)) {
        const matchedArea = ap.area;

        // Check if this clause is positive or negative
        const isPositiveClause = POSITIVE_WORDS.test(trimmed) && !/not\s+(?:good|nice|comfortable|well|perfect)/i.test(trimmed);
        const isNegative = /not\s+(?:good|nice|comfortable|well|perfect)/i.test(trimmed) ||
          /\b(?:too|very|super|extremely|uncomfortable|tight|loose|short|long|pinching|hurts|small)\b/i.test(trimmed);

        // Check specific issue pattern
        let matchedIssue: FitIssueType | null = null;
        for (const ip of ISSUE_PATTERNS) {
          if (ip.regex.test(trimmed)) {
            // Check negation: e.g. "not too tight"
            const negationCheck = new RegExp(`not\\s+(?:too\\s+)?${ip.issue.toLowerCase()}`, 'i');
            if (!negationCheck.test(trimmed)) {
              matchedIssue = ip.issue;
              break;
            }
          }
        }

        if (matchedIssue === 'Fits Correctly' || (isPositiveClause && !matchedIssue)) {
          if (!positiveAreas.includes(matchedArea)) {
            positiveAreas.push(matchedArea);
          }
        } else if (matchedIssue && matchedIssue !== 'Fits Correctly') {
          // Avoid duplicate area entry
          const existing = fitIssues.find((f) => f.area === matchedArea);
          if (!existing) {
            fitIssues.push({ area: matchedArea, issue: matchedIssue });
          }
        } else if (isNegative) {
          // Default issue if negative without specific keyword
          const existing = fitIssues.find((f) => f.area === matchedArea);
          if (!existing) {
            fitIssues.push({ area: matchedArea, issue: 'Too Tight' });
          }
        }
      }
    }
  }

  // Merge structured areas if user selected something not explicitly mentioned in text
  if (context?.structuredBodyAreas) {
    for (const item of context.structuredBodyAreas) {
      if (item.issue === 'Fits Correctly') {
        if (!positiveAreas.includes(item.area)) positiveAreas.push(item.area);
      } else {
        const existing = fitIssues.find((f) => f.area === item.area);
        if (!existing) {
          fitIssues.push({ area: item.area, issue: item.issue });
        }
      }
    }
  }

  // Calculate sentiment
  let sentiment: Sentiment = 'Neutral';
  const posCount = (normalized.match(POSITIVE_WORDS) || []).length + positiveAreas.length;
  const negCount = (normalized.match(NEGATIVE_WORDS) || []).length + fitIssues.length;

  if (context?.rating && context.rating >= 4 && fitIssues.length === 0) {
    sentiment = 'Positive';
  } else if (context?.rating && context.rating <= 2) {
    sentiment = 'Negative';
  } else if (negCount > posCount) {
    sentiment = 'Negative';
  } else if (posCount > negCount && fitIssues.length === 0) {
    sentiment = 'Positive';
  }

  // Calculate severity
  let severity: Severity = 'Medium';
  if (HIGH_SEVERITY_WORDS.test(normalized) || (context?.rating && context.rating === 1) || (context?.returnReason === 'Fit issue' && context?.rating && context.rating <= 2)) {
    severity = 'High';
  } else if (LOW_SEVERITY_WORDS.test(normalized) || (context?.rating && context.rating >= 4 && fitIssues.length <= 1)) {
    severity = 'Low';
  } else if (fitIssues.length >= 3) {
    severity = 'High';
  } else if (fitIssues.length > 0) {
    severity = 'Medium';
  }

  // Generate clear AI summary
  let aiSummary = '';
  if (fitIssues.length > 0) {
    const issueDescriptions = fitIssues.map((i) => `${i.area} (${i.issue})`).join(', ');
    aiSummary = `Detected fit issues in ${issueDescriptions}.`;
    if (positiveAreas.length > 0) {
      aiSummary += ` Well-fitting areas: ${positiveAreas.join(', ')}.`;
    }
  } else if (positiveAreas.length > 0) {
    aiSummary = `Optimal fit reported across ${positiveAreas.join(', ')}. No critical defects detected.`;
  } else {
    aiSummary = `General feedback logged with ${sentiment.toLowerCase()} tone.`;
  }

  return {
    fitIssues,
    positiveAreas,
    fitPreference: context?.fitPreference || 'Regular',
    sentiment,
    severity,
    returnReason: context?.returnReason || 'No return',
    aiSummary,
    engineUsed: 'Rule-based-NLP',
  };
}

/**
 * Primary AI Analysis entry point.
 * Attempts LLM API if key is set, otherwise utilizes the rule engine.
 */
export async function analyzeFeedback(
  text: string,
  context?: {
    garmentType?: string;
    size?: string;
    fitPreference?: string;
    returnReason?: string;
    rating?: number;
    structuredBodyAreas?: { area: BodyArea; issue: FitIssueType }[];
  }
): Promise<AiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const prompt = `You are an expert fashion fit intelligence classifier.
Analyze this customer clothing fit feedback:
"${text}"
Context:
- Garment Type: ${context?.garmentType || 'Unknown'}
- Size: ${context?.size || 'Unknown'}
- Fit Preference: ${context?.fitPreference || 'Regular'}
- Return Reason: ${context?.returnReason || 'None'}
- Rating: ${context?.rating || 'Unspecified'}

Output ONLY a JSON object with this exact structure:
{
  "fitIssues": [
    { "area": "Shoulders"|"Chest"|"Waist"|"Hips"|"Sleeves"|"Length"|"Neck"|"Arms"|"Thighs"|"Rise"|"Other", "issue": "Too Tight"|"Too Loose"|"Too Short"|"Too Long"|"Other" }
  ],
  "positiveAreas": ["Chest", ...],
  "fitPreference": "Slim"|"Regular"|"Relaxed"|"Oversized",
  "sentiment": "Positive"|"Neutral"|"Negative",
  "severity": "Low"|"Medium"|"High",
  "aiSummary": "Concise summary of findings"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
          signal: AbortSignal.timeout(4000), // 4 sec timeout
        }
      );

      if (response.ok) {
        const data = await response.json();
        const jsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          return {
            fitIssues: parsed.fitIssues || [],
            positiveAreas: parsed.positiveAreas || [],
            fitPreference: parsed.fitPreference || context?.fitPreference || 'Regular',
            sentiment: parsed.sentiment || 'Neutral',
            severity: parsed.severity || 'Medium',
            returnReason: context?.returnReason,
            aiSummary: parsed.aiSummary || 'Analyzed via Gemini 2.5 Flash',
            engineUsed: 'Gemini-2.5-Flash',
          };
        }
      }
    } catch {
      // Fallback on any network / parse failure
    }
  }

  // Reliable, instant rule-based fallback
  return analyzeWithRuleEngine(text, context);
}
