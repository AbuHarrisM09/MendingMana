const { pool } = require('../config/db');
const { formatGadgetRow } = require('./dbHelper');

// Helper to construct side-by-side specs matrix
async function getComparisonData(gadgetIds) {
  if (!gadgetIds || gadgetIds.length === 0) {
    return { gadgets: [], specGroups: [] };
  }

  // 1. Fetch detailed gadgets
  const gadgetsQuery = `
    SELECT 
      g.*,
      b.name as brand_name,
      c.name as category_name,
      (
        SELECT json_agg(file_url)
        FROM gadget_media gm
        WHERE gm.gadget_id = g.id
      ) as images
    FROM gadgets g
    LEFT JOIN brands b ON g.brand_id = b.id
    LEFT JOIN categories c ON g.category_id = c.id
    WHERE g.id = ANY($1::bigint[])
  `;
  const gadgetsRes = await pool.query(gadgetsQuery, [gadgetIds]);
  const gadgets = gadgetsRes.rows.map(formatGadgetRow);

  if (gadgets.length === 0) {
    return { gadgets: [], specGroups: [] };
  }

  // 2. Fetch all specs for these gadgets
  const specsQuery = `
    SELECT gadget_id, spec_group, spec_key, spec_value
    FROM gadget_specs
    WHERE gadget_id = ANY($1::bigint[])
    ORDER BY display_order ASC, spec_key ASC
  `;
  const specsRes = await pool.query(specsQuery, [gadgetIds]);

  // 3. Build unified specifications matrix
  const specGroupsMap = {};

  for (const spec of specsRes.rows) {
    const gId = `g-${spec.gadget_id}`;
    const groupName = spec.spec_group || 'Umum';
    const keyName = spec.spec_key;
    const val = spec.spec_value;

    if (!specGroupsMap[groupName]) {
      specGroupsMap[groupName] = {};
    }
    if (!specGroupsMap[groupName][keyName]) {
      specGroupsMap[groupName][keyName] = {};
    }
    specGroupsMap[groupName][keyName][gId] = val;
  }

  // Transform nested map into final side-by-side spec groups
  const specGroups = Object.keys(specGroupsMap).map(groupName => {
    const keysMap = specGroupsMap[groupName];
    const specs = Object.keys(keysMap).map(keyName => {
      const values = {};
      // Ensure every compared gadget has a value entry (default null)
      for (const g of gadgets) {
        values[g.id] = keysMap[keyName][g.id] || null;
      }
      return {
        key: keyName,
        values: values
      };
    });
    return {
      group: groupName,
      specs: specs
    };
  });

  return { gadgets, specGroups };
}

module.exports = {
  getComparisonData,
};
