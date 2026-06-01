const { formatGadgetRow } = require('./dbHelper');
const compareModel = require('../models/compareModel');

/**
 * Construct side-by-side specs matrix from an array of gadget IDs.
 * Uses compareModel for all data fetching.
 */
async function getComparisonData(gadgetIds) {
  if (!gadgetIds || gadgetIds.length === 0) {
    return { gadgets: [], specGroups: [] };
  }

  // 1. Fetch detailed gadgets
  const gadgetsRows = await compareModel.findGadgetsByIds(gadgetIds);
  const gadgets = gadgetsRows.map(formatGadgetRow);

  if (gadgets.length === 0) {
    return { gadgets: [], specGroups: [] };
  }

  // 2. Fetch all specs for these gadgets
  const specsRows = await compareModel.findSpecsByGadgetIds(gadgetIds);

  // 3. Build unified specifications matrix
  const specGroupsMap = {};

  for (const spec of specsRows) {
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
      for (const g of gadgets) {
        values[g.id] = keysMap[keyName][g.id] || null;
      }
      return { key: keyName, values };
    });
    return { group: groupName, specs };
  });

  return { gadgets, specGroups };
}

module.exports = {
  getComparisonData,
};
