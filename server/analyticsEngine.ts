import { Feedback, AnalyticsMetrics, BodyArea } from './types';

export function computeAnalytics(feedbacks: Feedback[]): AnalyticsMetrics {
  const total = feedbacks.length;
  if (total === 0) {
    return {
      totalFeedback: 0,
      avgOverallRating: 0,
      avgComfortRating: 0,
      avgSizeAccuracyRating: 0,
      fitIssueRate: 0,
      returnRate: 0,
      topIssue: 'None',
      mostAffectedSize: 'None',
      issuesByBodyArea: [],
      issueTypeDistribution: [],
      problemsBySize: [],
      problemsByGarmentType: [],
      sentimentDistribution: [],
      returnReasonsDistribution: [],
      trendOverTime: [],
    };
  }

  // Ratings
  const sumOverall = feedbacks.reduce((acc, f) => acc + f.overallRating, 0);
  const sumComfort = feedbacks.reduce((acc, f) => acc + f.comfortRating, 0);
  const sumSizeAcc = feedbacks.reduce((acc, f) => acc + f.sizeAccuracyRating, 0);

  const avgOverallRating = Number((sumOverall / total).toFixed(1));
  const avgComfortRating = Number((sumComfort / total).toFixed(1));
  const avgSizeAccuracyRating = Number((sumSizeAcc / total).toFixed(1));

  // Issue rate: feedback with at least one non-correct fit issue
  const feedbacksWithIssues = feedbacks.filter((f) =>
    f.bodyAreas.some((b) => b.issue !== 'Fits Correctly')
  );
  const fitIssueRate = Math.round((feedbacksWithIssues.length / total) * 100);

  // Return rate: returned products / total
  const returnedCount = feedbacks.filter(
    (f) => f.returnReason !== 'No return'
  ).length;
  const returnRate = Math.round((returnedCount / total) * 100);

  // Body areas frequency
  const areaCounts: Record<string, number> = {};
  const issueCounts: Record<string, number> = {};
  const specificIssueAreaCounts: Record<string, number> = {};

  for (const f of feedbacks) {
    for (const b of f.bodyAreas) {
      if (b.issue !== 'Fits Correctly') {
        areaCounts[b.area] = (areaCounts[b.area] || 0) + 1;
        issueCounts[b.issue] = (issueCounts[b.issue] || 0) + 1;
        const key = `${b.issue} ${b.area}`;
        specificIssueAreaCounts[key] = (specificIssueAreaCounts[key] || 0) + 1;
      } else {
        issueCounts['Fits Correctly'] = (issueCounts['Fits Correctly'] || 0) + 1;
      }
    }
  }

  const totalAreaIssues = Object.values(areaCounts).reduce((a, b) => a + b, 0) || 1;
  const issuesByBodyArea = Object.entries(areaCounts)
    .map(([area, count]) => ({
      area,
      count,
      percentage: Math.round((count / totalAreaIssues) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const totalIssuesRecorded = Object.values(issueCounts).reduce((a, b) => a + b, 0) || 1;
  const issueTypeDistribution = Object.entries(issueCounts)
    .map(([issue, count]) => ({
      issue,
      count,
      percentage: Math.round((count / totalIssuesRecorded) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Most reported issue name
  let topIssue = 'None';
  let topIssueMax = 0;
  for (const [key, count] of Object.entries(specificIssueAreaCounts)) {
    if (count > topIssueMax) {
      topIssueMax = count;
      topIssue = key;
    }
  }

  // Problems by size (XS to XXL)
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const problemsBySize = sizes.map((sz) => {
    const sizeFeedback = feedbacks.filter((f) => f.size === sz);
    const sizeIssues = sizeFeedback.filter((f) =>
      f.bodyAreas.some((b) => b.issue !== 'Fits Correctly')
    );
    const issueRate = sizeFeedback.length > 0
      ? Math.round((sizeIssues.length / sizeFeedback.length) * 100)
      : 0;
    return {
      size: sz,
      totalFeedback: sizeFeedback.length,
      issueCount: sizeIssues.length,
      issueRate,
    };
  });

  // Most affected size normalized by issue rate with minimum sample size >= 3
  const qualifiedSizes = problemsBySize.filter((s) => s.totalFeedback >= 3);
  const mostAffected = qualifiedSizes.sort((a, b) => b.issueRate - a.issueRate)[0];
  const mostAffectedSize = mostAffected ? `${mostAffected.size} (${mostAffected.issueRate}%)` : 'M';

  // Problems by garment type
  const garmentGroups: Record<string, { total: number; issues: number; ratingSum: number }> = {};
  for (const f of feedbacks) {
    if (!garmentGroups[f.garmentType]) {
      garmentGroups[f.garmentType] = { total: 0, issues: 0, ratingSum: 0 };
    }
    garmentGroups[f.garmentType].total += 1;
    garmentGroups[f.garmentType].ratingSum += f.overallRating;
    if (f.bodyAreas.some((b) => b.issue !== 'Fits Correctly')) {
      garmentGroups[f.garmentType].issues += 1;
    }
  }

  const problemsByGarmentType = Object.entries(garmentGroups)
    .map(([garmentType, data]) => ({
      garmentType,
      count: data.total,
      issueRate: Math.round((data.issues / data.total) * 100),
      avgRating: Number((data.ratingSum / data.total).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  // Sentiment
  const sentimentCounts: Record<string, number> = { Positive: 0, Neutral: 0, Negative: 0 };
  for (const f of feedbacks) {
    const s = f.aiAnalysis.sentiment;
    sentimentCounts[s] = (sentimentCounts[s] || 0) + 1;
  }
  const sentimentDistribution = Object.entries(sentimentCounts).map(([sentiment, count]) => ({
    sentiment,
    count,
    percentage: Math.round((count / total) * 100),
  }));

  // Return reasons
  const returnCounts: Record<string, number> = {};
  for (const f of feedbacks) {
    returnCounts[f.returnReason] = (returnCounts[f.returnReason] || 0) + 1;
  }
  const returnReasonsDistribution = Object.entries(returnCounts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Trend over time (weekly/monthly chronological buckets)
  const timeBuckets: Record<string, { total: number; complaints: number; ratingSum: number }> = {};
  for (const f of feedbacks) {
    const dateStr = f.timestamp.slice(0, 10);
    // Group into 5-day intervals or standard date
    if (!timeBuckets[dateStr]) {
      timeBuckets[dateStr] = { total: 0, complaints: 0, ratingSum: 0 };
    }
    timeBuckets[dateStr].total += 1;
    timeBuckets[dateStr].ratingSum += f.overallRating;
    if (f.bodyAreas.some((b) => b.issue !== 'Fits Correctly')) {
      timeBuckets[dateStr].complaints += 1;
    }
  }

  const sortedDates = Object.keys(timeBuckets).sort();
  const trendOverTime = sortedDates.map((date) => ({
    date: date.slice(5), // MM-DD
    totalFeedback: timeBuckets[date].total,
    complaints: timeBuckets[date].complaints,
    avgRating: Number((timeBuckets[date].ratingSum / timeBuckets[date].total).toFixed(1)),
  }));

  return {
    totalFeedback: total,
    avgOverallRating,
    avgComfortRating,
    avgSizeAccuracyRating,
    fitIssueRate,
    returnRate,
    topIssue,
    mostAffectedSize,
    issuesByBodyArea,
    issueTypeDistribution,
    problemsBySize,
    problemsByGarmentType,
    sentimentDistribution,
    returnReasonsDistribution,
    trendOverTime,
  };
}

/**
 * Size-Specific Comparative Analysis Engine
 * Calculates dynamic statistical conclusions between sizes for a selected garment
 */
export function computeSizeSpecificAnalysis(
  feedbacks: Feedback[],
  garmentType: string,
  targetSize: string
) {
  const garmentFeedbacks = feedbacks.filter(
    (f) => !garmentType || f.garmentType.toLowerCase() === garmentType.toLowerCase()
  );

  const targetFeedbacks = garmentFeedbacks.filter((f) => f.size === targetSize);
  const otherSizesFeedbacks = garmentFeedbacks.filter((f) => f.size !== targetSize);

  // Count issues per area for target size
  const targetAreaIssues: Record<string, number> = {};
  for (const f of targetFeedbacks) {
    for (const b of f.bodyAreas) {
      if (b.issue !== 'Fits Correctly') {
        const key = `${b.area}:${b.issue}`;
        targetAreaIssues[key] = (targetAreaIssues[key] || 0) + 1;
      }
    }
  }

  // Count issues per area for other sizes
  const otherAreaIssues: Record<string, { [sz: string]: number }> = {};
  for (const f of otherSizesFeedbacks) {
    for (const b of f.bodyAreas) {
      if (b.issue !== 'Fits Correctly') {
        const key = `${b.area}:${b.issue}`;
        if (!otherAreaIssues[key]) otherAreaIssues[key] = {};
        otherAreaIssues[key][f.size] = (otherAreaIssues[key][f.size] || 0) + 1;
      }
    }
  }

  // Generate dynamic dynamic comparative findings
  const conclusions: {
    id: string;
    area: string;
    issue: string;
    statStatement: string;
    comparisonStatement: string;
    targetRate: number;
    comparativeRate: number;
  }[] = [];

  const targetCount = targetFeedbacks.length || 1;

  for (const [key, count] of Object.entries(targetAreaIssues)) {
    const [area, issue] = key.split(':');
    const targetRate = Math.round((count / targetCount) * 100);

    // Compare with closest adjacent size (e.g. if target is M, compare with S or L)
    let comparisonSize = 'S';
    if (targetSize === 'S') comparisonSize = 'M';
    else if (targetSize === 'M') comparisonSize = 'S';
    else if (targetSize === 'L') comparisonSize = 'M';
    else if (targetSize === 'XL') comparisonSize = 'L';
    else if (targetSize === 'XXL') comparisonSize = 'XL';

    const compSizeFeedbacks = garmentFeedbacks.filter((f) => f.size === comparisonSize);
    const compSizeCount = compSizeFeedbacks.length || 1;
    const compIssuesCount = otherAreaIssues[key]?.[comparisonSize] || 0;
    const compRate = Math.round((compIssuesCount / compSizeCount) * 100);

    let diffPercent = 0;
    let diffText = '';

    if (compRate > 0) {
      diffPercent = Math.round(((targetRate - compRate) / compRate) * 100);
      if (diffPercent > 0) {
        diffText = `Size ${targetSize} has ${diffPercent}% more ${area.toLowerCase()} ${issue.toLowerCase()} complaints than Size ${comparisonSize}.`;
      } else if (diffPercent < 0) {
        diffText = `Size ${targetSize} has ${Math.abs(diffPercent)}% fewer ${area.toLowerCase()} ${issue.toLowerCase()} complaints than Size ${comparisonSize}.`;
      } else {
        diffText = `Size ${targetSize} has a comparable rate of ${area.toLowerCase()} complaints to Size ${comparisonSize}.`;
      }
    } else {
      diffText = `Size ${targetSize} experiences a high concentration of ${area.toLowerCase()} ${issue.toLowerCase()} complaints (${targetRate}%), which is largely absent in Size ${comparisonSize}.`;
    }

    conclusions.push({
      id: `conc-${area}-${issue}`,
      area,
      issue,
      statStatement: `${targetRate}% of Size ${targetSize} ${garmentType || 'garment'} customers report "${issue}" on ${area}.`,
      comparisonStatement: diffText,
      targetRate,
      comparativeRate: compRate,
    });
  }

  return {
    garmentType,
    targetSize,
    sampleSize: targetFeedbacks.length,
    conclusions: conclusions.sort((a, b) => b.targetRate - a.targetRate),
  };
}

/**
 * Heatmap calculation
 * Computes frequency and severity for every body area
 */
export function computeHeatmap(feedbacks: Feedback[], garmentType?: string) {
  const relevant = garmentType
    ? feedbacks.filter((f) => f.garmentType.toLowerCase() === garmentType.toLowerCase())
    : feedbacks;

  const total = relevant.length || 1;
  const areas: BodyArea[] = [
    'Shoulders',
    'Chest',
    'Waist',
    'Hips',
    'Sleeves',
    'Length',
    'Neck',
    'Arms',
    'Thighs',
    'Rise',
  ];

  const result = areas.map((area) => {
    const matching = relevant.filter((f) =>
      f.bodyAreas.some((b) => b.area === area && b.issue !== 'Fits Correctly')
    );
    const count = matching.length;
    const frequencyPercent = Math.round((count / total) * 100);

    // Primary issue
    const issueCounts: Record<string, number> = {};
    for (const f of matching) {
      const issueObj = f.bodyAreas.find((b) => b.area === area);
      if (issueObj) {
        issueCounts[issueObj.issue] = (issueCounts[issueObj.issue] || 0) + 1;
      }
    }
    const primaryIssue =
      Object.entries(issueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Too Tight';

    // Intensity calculation
    let intensity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL' = 'NORMAL';
    if (frequencyPercent >= 25) {
      intensity = 'HIGH';
    } else if (frequencyPercent >= 15) {
      intensity = 'MEDIUM';
    } else if (frequencyPercent >= 6) {
      intensity = 'LOW';
    }

    return {
      area,
      count,
      frequencyPercent,
      primaryIssue,
      intensity,
    };
  });

  return result.sort((a, b) => b.frequencyPercent - a.frequencyPercent);
}
