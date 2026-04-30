const {
  getOverviewStats,
  getSentimentStats,
  getWeeklyReviews,
  getTopReviewedGadgets,
  getRecentReviews,
} = require('../models/adminDashboardModel');

function toPercent(value, total) {
  if (!total) {
    return 0;
  }

  return Number(((value / total) * 100).toFixed(2));
}

async function getAdminDashboardData() {
  const [overview, sentiment, weeklyReviews, topReviewedGadgets, recentReviews] =
    await Promise.all([
      getOverviewStats(),
      getSentimentStats(),
      getWeeklyReviews(),
      getTopReviewedGadgets(5),
      getRecentReviews(5),
    ]);

  const totalSentiment =
    Number(sentiment.positive || 0) +
    Number(sentiment.neutral || 0) +
    Number(sentiment.negative || 0);

  return {
    overview: {
      totalUsers: Number(overview.total_users || 0),
      bannedUsers: Number(overview.banned_users || 0),
      totalGadgets: Number(overview.total_gadgets || 0),
      totalReviews: Number(overview.total_reviews || 0),
      pendingModeration: Number(overview.pending_moderation || 0),
    },
    sentiment: {
      positive: Number(sentiment.positive || 0),
      neutral: Number(sentiment.neutral || 0),
      negative: Number(sentiment.negative || 0),
      positivePercent: toPercent(Number(sentiment.positive || 0), totalSentiment),
      neutralPercent: toPercent(Number(sentiment.neutral || 0), totalSentiment),
      negativePercent: toPercent(Number(sentiment.negative || 0), totalSentiment),
    },
    charts: {
      weeklyReviews,
      topReviewedGadgets,
    },
    recentReviews,
  };
}

module.exports = {
  getAdminDashboardData,
};
