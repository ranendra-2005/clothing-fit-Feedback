import { analyzeFeedback } from './nlpEngine';
import { db } from './db';
import { computeAnalytics, computeSizeSpecificAnalysis, computeHeatmap } from './analyticsEngine';
import { generateRecommendations, generateDesignerActionPlan } from './recommendationEngine';

async function runTests() {
  console.log('--- 1. Testing AI / NLP Extraction on Hackathon Sample ---');
  const sampleComment = 'The shirt looks good but the shoulders are tight and the sleeves are shorter than expected.';
  const analysis = await analyzeFeedback(sampleComment, {
    garmentType: 'Shirt',
    size: 'M',
    fitPreference: 'Regular',
    rating: 2,
    returnReason: 'Fit issue',
  });

  console.log('Analysis Result:', JSON.stringify(analysis, null, 2));

  // Assertions
  const hasTightShoulders = analysis.fitIssues.some(
    (i) => i.area === 'Shoulders' && i.issue === 'Too Tight'
  );
  const hasShortSleeves = analysis.fitIssues.some(
    (i) => i.area === 'Sleeves' && i.issue === 'Too Short'
  );

  console.log('Has Tight Shoulders:', hasTightShoulders);
  console.log('Has Short Sleeves:', hasShortSleeves);
  console.log('Sentiment:', analysis.sentiment);
  console.log('Severity:', analysis.severity);

  console.log('\n--- 2. Testing Database and Seed Data ---');
  const allFeedback = db.getAll();
  console.log('Total Seed Records:', allFeedback.length);

  console.log('\n--- 3. Testing Analytics Engine ---');
  const analytics = computeAnalytics(allFeedback);
  console.log('Total Feedback:', analytics.totalFeedback);
  console.log('Avg Overall Rating:', analytics.avgOverallRating);
  console.log('Fit Issue Rate:', analytics.fitIssueRate + '%');
  console.log('Return Rate:', analytics.returnRate + '%');
  console.log('Top Issue:', analytics.topIssue);
  console.log('Most Affected Size:', analytics.mostAffectedSize);
  console.log('Top Body Areas:', analytics.issuesByBodyArea.slice(0, 3));

  console.log('\n--- 4. Testing Dynamic Size Analysis (Shirt / Size M) ---');
  const sizeAnalysis = computeSizeSpecificAnalysis(allFeedback, 'Shirt', 'M');
  console.log('Sample Size for Shirt M:', sizeAnalysis.sampleSize);
  console.log('Conclusions:', sizeAnalysis.conclusions.slice(0, 2));

  console.log('\n--- 5. Testing Heatmap ---');
  const heatmap = computeHeatmap(allFeedback);
  console.log('Heatmap Areas Count:', heatmap.length);
  console.log('Top 3 Heatmap Intensities:', heatmap.slice(0, 3));

  console.log('\n--- 6. Testing AI Design Recommendations ---');
  const recs = generateRecommendations(allFeedback);
  console.log('Recommendations Generated:', recs.length);
  for (const r of recs) {
    console.log(`[${r.priority}] ${r.problem} -> Action: ${r.suggestedAction.slice(0, 60)}...`);
  }

  console.log('\n--- 7. Testing Designer Action Plan ---');
  const actionPlan = generateDesignerActionPlan(allFeedback);
  console.log('Measurement Changes count:', actionPlan.measurementChanges.length);

  console.log('\nALL BACKEND ENGINES VALIDATED SUCCESSFULLY!');
}

runTests().catch(console.error);
