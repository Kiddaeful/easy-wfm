export const similarAttributes = [
  ['toxin_damage', 'heat_damage', 'electric_damage', 'cold_damage'],
  ['slash_damage', 'impact_damage', 'puncture_damage'],
  ['critical_chance', 'critical_damage', 'base_damage_/_melee_damage', 'multishot', 'status_chance'],
];

export const goodAttributes = [
  'critical_chance',
  'critical_damage',
  'base_damage_/_melee_damage',
  'multishot',
  'status_chance',
  'toxin_damage',
  'heat_damage',
  'electric_damage',
  'cold_damage'
];

export const badNegativeAttributes = [
  'critical_chance',
  'critical_damage',
  'base_damage_/_melee_damage',
  'multishot',
  'status_chance',
  'status_duration'
];

/**
 * Generates search queries for finding similar Rivens
 * @param {Object} data - The Riven data from the form
 * @param {Array} knownWeapons - List of known weapons
 * @returns {Array} List of query objects
 */
export function generateSimilarRivenQueries(data, knownWeapons) {
  const weapon = knownWeapons.find(w => 
    (w.item_name && w.item_name.toLowerCase() === data.weaponName?.toLowerCase()) || 
    (w.url_name && w.url_name === data.weaponName)
  );

  if (!weapon) {
    console.warn('Weapon not found for search:', data.weaponName);
    return [];
  }

  // Special case for Trash Rivens
  // If user selected "trash", we ignore attributes and search for cheapest price only
  if (data.rolls === 0) {
    return [{
      weapon_url_name: weapon.url_name,
      buyout_policy: 'direct',
      sort_by: 'price_asc',
      platform: 'pc',
      polarity: 'any',
      re_rolls_max: 0,
      _label: 'Trash'
    }];
  }

  const positiveStats = data.stats.filter(s => {
    if (!s.matchedAttribute) return false;
    // Recoil exception: Negative value is GOOD (Positive type)
    // We trust that type is correctly set upstream (parser/new-tab)
    return s.type === 'positive';
  });

  const negativeStats = data.stats.filter(s => {
    if (!s.matchedAttribute) return false;
    return s.type === 'negative';
  });
  
  if (positiveStats.length === 0) {
    return [];
  }

  const baseQuery = {
    weapon_url_name: weapon.url_name,
    buyout_policy: 'direct',
    sort_by: 'price_asc',
    platform: 'pc',
    polarity: 'any'
  };

  const queries = [];

  // Call 1: Identical
  const positivesStr = positiveStats.map(s => s.matchedAttribute.url_name).join(',');

  // If there are no negative attributes, query param should not be added
  const negativesStr = negativeStats.length > 0 
    ? negativeStats.map(s => s.matchedAttribute.url_name).join(',') 
    : undefined;

  queries.push({
    ...baseQuery,
    positive_stats: positivesStr,
    ...(negativesStr ? { negative_stats: negativesStr } : {}),
    _label: 'Similar',
  });

  // Determine priority rules
  const potentialRules = [];

  // Rule 1: if there is a negative attribute search without it
  if (negativeStats.length > 0) {
    potentialRules.push({
      ...baseQuery,
      positive_stats: positivesStr,
      negative_stats: "none",
      _label: 'Similar without negative attribute',
    });
  }

  // New rules for similar attributes
  positiveStats.forEach((stat, index) => {
    const attrName = stat.matchedAttribute.url_name;
    
    // Find if this attribute belongs to a similar group
    const similarGroup = similarAttributes.find(group => group.includes(attrName));
    
    if (similarGroup) {
      // Remove from the group attribute that is already in the positive stats
      const newGroup = similarGroup.filter(attr => !positiveStats.some(s => s.matchedAttribute.url_name === attr));
      // For each other attribute in the group
      newGroup.forEach(similarAttr => {
        if (similarAttr !== attrName) {
            // Create a new list of positives with the replacement
            const newPositiveNames = positiveStats.map(s => s.matchedAttribute.url_name);
            newPositiveNames[index] = similarAttr;
            
            potentialRules.push({
                ...baseQuery,
                positive_stats: newPositiveNames.join(','),
                ...(negativesStr ? { negative_stats: negativesStr } : {}),
                _label: `Similar attributes`,
                _removed: attrName,
                _added: similarAttr,
            });
        }
      });
    }
  });

  // Rule 2: If there are 3 positive attributes, search without the last one
  if (positiveStats.length === 3) {
    const subset = positiveStats.slice(0, 2).map(s => s.matchedAttribute.url_name).join(',');
    potentialRules.push({
      ...baseQuery,
      positive_stats: subset,
      ...(negativesStr ? { negative_stats: negativesStr } : {}),
      _label: 'Similar one less attribute',
    });
  }

  // Rule 3: Search without the first positive attribute
  if (positiveStats.length > 1) {
    const subset = positiveStats.slice(1).map(s => s.matchedAttribute.url_name).join(',');
    potentialRules.push({
      ...baseQuery,
      positive_stats: subset,
      ...(negativesStr ? { negative_stats: negativesStr } : {}),
      _label: 'Similar one less attribute',
    });
  }

  // Rule 4: Search without the last positive attribute
  if (positiveStats.length > 1) {
    const subset = positiveStats.slice(0, positiveStats.length - 1).map(s => s.matchedAttribute.url_name).join(',');
    // Check duplication with Rule 2
    const isDuplicate = potentialRules.some(q => q.positive_stats === subset && q.negative_stats === negativesStr);
    if (!isDuplicate) {
        potentialRules.push({
            ...baseQuery,
            positive_stats: subset,
            ...(negativesStr ? { negative_stats: negativesStr } : {}),
            _label: 'Similar one less attribute',
        });
    }
  }

  // Return all potential rules to allow iteration until data is found
  queries.push(...potentialRules);

  return queries;
}
