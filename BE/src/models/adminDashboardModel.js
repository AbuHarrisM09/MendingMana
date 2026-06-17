const { query } = require('../config/db');

async function getOverviewStats() {
  const sql = `
    WITH member_count AS (
      SELECT COUNT(*)::integer AS total
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE r.name = 'member'
    ),
    banned_member_count AS (
      SELECT COUNT(*)::integer AS total
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE r.name = 'member'
        AND (
          u.is_banned = TRUE
          AND (u.banned_until IS NULL OR u.banned_until > NOW())
        )
    ),
    gadget_count AS (
      SELECT COUNT(*)::integer AS total
      FROM gadgets
      WHERE status <> 'archived'
    ),
    review_count AS (
      SELECT COUNT(*)::integer AS total
      FROM reviews
      WHERE parent_review_id IS NULL
        AND is_deleted = FALSE
    ),
    pending_moderation AS (
      SELECT COUNT(DISTINCT rr.review_id)::integer AS total
      FROM review_reports rr
      WHERE rr.status = 'pending'
    )
    SELECT
      (SELECT total FROM member_count) AS total_users,
      (SELECT total FROM banned_member_count) AS banned_users,
      (SELECT total FROM gadget_count) AS total_gadgets,
      (SELECT total FROM review_count) AS total_reviews,
      (SELECT total FROM pending_moderation) AS pending_moderation
  `;

  const { rows } = await query(sql);
  return rows[0];
}

async function getSentimentStats() {
  const sql = `
    SELECT
      COUNT(*) FILTER (WHERE rating >= 4)::integer AS positive,
      COUNT(*) FILTER (WHERE rating = 3)::integer AS neutral,
      COUNT(*) FILTER (WHERE rating <= 2)::integer AS negative
    FROM reviews
    WHERE parent_review_id IS NULL
      AND is_deleted = FALSE
      AND rating IS NOT NULL
  `;

  const { rows } = await query(sql);
  return rows[0];
}

async function getWeeklyReviews() {
  const sql = `
    WITH days AS (
      SELECT generate_series(
        date_trunc('day', NOW()) - INTERVAL '6 day',
        date_trunc('day', NOW()),
        INTERVAL '1 day'
      )::date AS day
    )
    SELECT
      to_char(d.day, 'Dy') AS day,
      COALESCE(COUNT(r.id), 0)::integer AS reviews
    FROM days d
    LEFT JOIN reviews r
      ON date_trunc('day', r.created_at)::date = d.day
      AND r.parent_review_id IS NULL
      AND r.is_deleted = FALSE
    GROUP BY d.day
    ORDER BY d.day
  `;

  const { rows } = await query(sql);
  return rows;
}

async function getTopReviewedGadgets(limit = 5) {
  const sql = `
    SELECT
      g.id,
      g.name,
      COUNT(r.id)::integer AS reviews
    FROM gadgets g
    LEFT JOIN reviews r
      ON r.gadget_id = g.id
      AND r.parent_review_id IS NULL
      AND r.is_deleted = FALSE
      AND r.created_at >= NOW() - INTERVAL '7 day'
    WHERE g.status <> 'archived'
    GROUP BY g.id, g.name
    ORDER BY reviews DESC, g.name ASC
    LIMIT $1
  `;

  const { rows } = await query(sql, [limit]);
  return rows;
}

async function getRecentReviews(limit = 5) {
  const sql = `
    SELECT
      r.id,
      r.gadget_id,
      g.name AS gadget_name,
      r.user_id,
      u.full_name AS user_name,
      u.profile_image_url AS user_avatar,
      r.rating,
      COALESCE(r.title, '') AS title,
      LEFT(r.review_text, 140) AS content_preview,
      r.created_at,
      COALESCE(report_stats.total_reports, 0)::integer AS report_count,
      CASE
        WHEN COALESCE(report_stats.pending_reports, 0) > 0 THEN 'pending'
        WHEN COALESCE(report_stats.total_reports, 0) = 0 THEN 'approved'
        ELSE 'reviewed'
      END AS moderation_status
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    JOIN gadgets g ON g.id = r.gadget_id
    LEFT JOIN (
      SELECT
        review_id,
        COUNT(*) AS total_reports,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_reports
      FROM review_reports
      GROUP BY review_id
    ) report_stats ON report_stats.review_id = r.id
    WHERE r.parent_review_id IS NULL
      AND r.is_deleted = FALSE
    ORDER BY r.created_at DESC
    LIMIT $1
  `;

  const { rows } = await query(sql, [limit]);
  return rows;
}

module.exports = {
  getOverviewStats,
  getSentimentStats,
  getWeeklyReviews,
  getTopReviewedGadgets,
  getRecentReviews,
};
