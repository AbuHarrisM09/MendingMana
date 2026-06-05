const { query } = require('../config/db');

async function getAllReports({ search = '', status = 'all', page = 1, limit = 15 }) {
  const offset = (page - 1) * limit;
  const params = [];
  let paramIndex = 1;

  let whereClause = 'WHERE 1=1';

  if (status && status !== 'all') {
    whereClause += ` AND rr.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  if (search) {
    whereClause += ` AND (
      lower(r.review_text) LIKE lower($${paramIndex})
      OR lower(u.full_name) LIKE lower($${paramIndex})
      OR lower(ur.full_name) LIKE lower($${paramIndex})
    )`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  // Count query
  const countSql = `
    SELECT COUNT(*)::integer AS total
    FROM review_reports rr
    JOIN reviews r ON r.id = rr.review_id
    JOIN users ur ON ur.id = rr.reporter_user_id
    JOIN users u ON u.id = r.user_id
    JOIN gadgets g ON g.id = r.gadget_id
    ${whereClause}
  `;
  const { rows: countRows } = await query(countSql, params);
  const total = countRows[0].total;

  // Data query
  const dataSql = `
    SELECT
      rr.id AS report_id,
      rr.review_id,
      rr.reporter_user_id,
      ur.full_name AS reporter_name,
      rr.reason_code,
      rr.reason AS reason_text,
      rr.status AS report_status,
      rr.created_at AS reported_at,
      rr.resolved_at,
      rr.handled_note,
      r.review_text,
      r.rating AS review_rating,
      r.title AS review_title,
      r.is_deleted AS review_is_deleted,
      r.user_id AS author_id,
      u.full_name AS author_name,
      u.profile_image_url AS author_avatar,
      g.name AS gadget_name,
      g.slug AS gadget_slug
    FROM review_reports rr
    JOIN reviews r ON r.id = rr.review_id
    JOIN users ur ON ur.id = rr.reporter_user_id
    JOIN users u ON u.id = r.user_id
    JOIN gadgets g ON g.id = r.gadget_id
    ${whereClause}
    ORDER BY rr.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataParams = [...params, limit, offset];
  const { rows } = await query(dataSql, dataParams);

  return {
    reports: rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

async function findReportById(reportId) {
  const sql = `
    SELECT * FROM review_reports WHERE id = $1
  `;
  const { rows } = await query(sql, [reportId]);
  return rows[0] || null;
}

async function updateReportStatus(reportId, { status, handledBy, handledNote = null }) {
  const sql = `
    UPDATE review_reports
    SET 
      status = $2, 
      handled_by = $3, 
      handled_note = $4, 
      resolved_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const { rows } = await query(sql, [reportId, status, handledBy, handledNote]);
  return rows[0] || null;
}

async function resolveAllReportsForReview(reviewId, { handledBy, handledNote = null }) {
  const sql = `
    UPDATE review_reports
    SET 
      status = 'resolved', 
      handled_by = $2, 
      handled_note = $3, 
      resolved_at = NOW()
    WHERE review_id = $1 AND status = 'pending'
    RETURNING *
  `;
  const { rows } = await query(sql, [reviewId, handledBy, handledNote]);
  return rows;
}

async function softDeleteReview(reviewId) {
  const sql = `
    UPDATE reviews
    SET 
      is_deleted = TRUE, 
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const { rows } = await query(sql, [reviewId]);
  return rows[0] || null;
}

module.exports = {
  getAllReports,
  findReportById,
  updateReportStatus,
  resolveAllReportsForReview,
  softDeleteReview,
};
