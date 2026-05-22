// Helper functions for database data shaping and parsing

function parseGadgetId(value) {
  if (!value) return null;
  const cleaned = String(value).startsWith('g-') ? String(value).slice(2) : String(value);
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatGadgetRow(row) {
  return {
    id: `g-${row.id}`,
    name: row.name,
    brand: row.brand_name || row.brand,
    category: row.category_name || row.category,
    price: Number(row.price),
    images: row.images
      ? row.images.map((img) => (img.startsWith('http') || img.startsWith('data:') ? img : `http://localhost:5000${img}`))
      : [],
    description: row.description,
    summary: row.summary,
    releaseDate: row.release_date || row.releaseDate,
    averageRating: Number(row.average_rating || row.averageRating || 0),
    totalReviews: Number(row.total_reviews || row.totalReviews || 0),
    isNew: true,
    isTrending: true,
  };
}

async function getGadgetsColumns(client) {
  const result = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'gadgets'`,
  );
  return new Set(result.rows.map((r) => r.column_name));
}

module.exports = {
  parseGadgetId,
  formatGadgetRow,
  getGadgetsColumns,
};
