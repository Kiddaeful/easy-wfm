// Module for parsing Riven mod data from OCR text

/**
 * @param {string} text 
 */
export function getPrefix(text) {
  switch (text) {
    case 'ammo_maximum':
      return 'Ampi';
    case 'damage_vs_corpus':
      return 'Manti';
    case 'damage_vs_grineer':
      return 'Argi';
    case 'damage_vs_infested':
      return 'Vexi';
    case 'critical_chance':
      return 'Crita';
    case 'critical_damage':
      return 'Acri';
    case 'base_damage_/_melee_damage':
      return 'Visi';
    case 'critical_chance_on_slide_attack':
      return 'Pleci';
    case 'combo_duration':
      return 'Tempi';
    case 'electric_damage':
      return 'Vexi';
    case 'cold_damage':
      return 'Zeti';
    case 'heat_damage':
      return 'Igni';
    case 'finisher_damage':
      return 'Exi';
    case 'fire_rate_/_attack_speed':
      return 'Croni';
    case 'projectile_speed':
      return 'Conci';
    case 'channeling_damage':
      return 'Para';
    case 'channeling_efficiency':
      return 'Forti';
    case 'impact_damage':
      return 'Magna';
    case 'magazine_capacity':
      return 'Arma';
    case 'multishot':
      return 'Sati';
    case 'toxin_damage':
      return 'Toxi';
    case 'punch_through':
      return 'Lexi';
    case 'puncture_damage':
      return 'Insi';
    case 'reload_speed':
      return 'Feva';
    case 'range':
      return 'Locti';
    case 'slash_damage':
      return 'Sci';
    case 'status_chance':
      return 'Hexa';
    case 'status_duration':
      return 'Deci';
    case 'recoil':
      return 'Zeti';
    case 'zoom':
      return 'Hera';
    case 'chance_to_gain_extra_combo_count':
      return 'Laci';
    case 'chance_to_gain_combo_count':
      return 'Nus';
    default:
      return null;
  }
}

/**

 * @param {string} text 
 */
export function getSuffix(text) {
  switch (text) {
    case 'ammo_maximum':
      return 'Bin';
    case 'damage_vs_corpus':
      return 'Tron';
    case 'damage_vs_grineer':
      return 'Con';
    case 'damage_vs_infested':
      return 'Ada';
    case 'cold_damage':
      return 'Do';
    case 'channeling_damage':
      return 'Um';
    case 'channeling_efficiency':
      return 'Us';
    case 'combo_duration':
      return 'Nem';
    case 'critical_chance':
      return 'Cron';
    case 'critical_chance_on_slide_attack':
      return 'Nent';
    case 'critical_damage':
      return 'Tis';
    case 'base_damage_/_melee_damage':
      return 'Ata';
    case 'electric_damage':
      return 'Tio';
    case 'heat_damage':
      return 'Pha';
    case 'finisher_damage':
      return 'Cta';
    case 'fire_rate_/_attack_speed':
      return 'Dra';
    case 'projectile_speed':
      return 'Nak';
    case 'impact_damage':
      return 'Ton';
    case 'magazine_capacity':
      return 'Tin';
    case 'multishot':
      return 'Can';
    case 'toxin_damage':
      return 'Tox';
    case 'punch_through':
      return 'Nok';
    case 'puncture_damage':
      return 'Cak';
    case 'reload_speed':
      return 'Tak';
    case 'range':
      return 'Tor';
    case 'slash_damage':
      return 'Sus';
    case 'status_chance':
      return 'Dex';
    case 'status_duration':
      return 'Des';
    case 'recoil':
      return 'Mag';
    case 'zoom':
      return 'Lis';
    case 'chance_to_gain_extra_combo_count':
      return 'Nus';
    default:
      return null;
  }
}

/**
 * Returns the base value of a stat for a weapon type
 * @param {string} statUrlName - The url_name of the stat
 * @param {string} weaponType - The weapon type (rifle, shotgun, pistol, archgun, melee)
 * @returns {number|null} Base value or null if not found
 */
export function getStatBaseValue(statUrlName, weaponType) {
  // Base values table - extracted from the provided markdown table
  const baseValues = {
    'chance_to_gain_extra_combo_count': { rifle: null, shotgun: null, pistol: null, archgun: null, melee: 58.77 },
    'chance_to_gain_combo_count': { rifle: null, shotgun: null, pistol: null, archgun: null, melee: 104.85 },
    'ammo_maximum': { rifle: 49.95, shotgun: 90, pistol: 90, archgun: 99.9, melee: null },
    'damage_vs_corpus': { rifle: 45, shotgun: 45, pistol: 45, archgun: 45, melee: 45 },
    'damage_vs_grineer': { rifle: 45, shotgun: 45, pistol: 45, archgun: 45, melee: 45 },
    'damage_vs_infested': { rifle: 45, shotgun: 45, pistol: 45, archgun: 45, melee: 45 },
    'cold_damage': { rifle: 90, shotgun: 90, pistol: 90, archgun: 119.7, melee: 90 },
    'combo_duration': { rifle: null, shotgun: null, pistol: null, archgun: null, melee: 8.1 },
    'critical_chance': { rifle: 149.99, shotgun: 90, pistol: 149.99, archgun: 99.9, melee: 180 },
    'critical_chance_on_slide_attack': { rifle: null, shotgun: null, pistol: null, archgun: null, melee: 120 },
    'critical_damage': { rifle: 120, shotgun: 90, pistol: 90, archgun: 80.1, melee: 90 },
    'base_damage_/_melee_damage': { rifle: 165, shotgun: 164.7, pistol: 219.6, archgun: 99.9, melee: 164.7 },
    'electric_damage': { rifle: 90, shotgun: 90, pistol: 90, archgun: 119.7, melee: 90 },
    'heat_damage': { rifle: 90, shotgun: 90, pistol: 90, archgun: 119.7, melee: 90 },
    'finisher_damage': { rifle: null, shotgun: null, pistol: null, archgun: null, melee: 119.7 },
    'fire_rate_/_attack_speed': { rifle: 60.03, shotgun: 89.1, pistol: 74.7, archgun: 60.03, melee: 54.9 },
    'projectile_speed': { rifle: 90, shotgun: 89.1, pistol: 90, archgun: null, melee: null },
    'channeling_damage': { rifle: null, shotgun: null, pistol: null, archgun: null, melee: 24.5 },
    'impact_damage': { rifle: 119.97, shotgun: 119.97, pistol: 119.97, archgun: 90, melee: 119.7 },
    'magazine_capacity': { rifle: 50, shotgun: 50, pistol: 50, archgun: 60.3, melee: null },
    'channeling_efficiency': { rifle: null, shotgun: null, pistol: null, archgun: null, melee: 73.44 },
    'multishot': { rifle: 90, shotgun: 119.7, pistol: 119.7, archgun: 60.3, melee: null },
    'toxin_damage': { rifle: 90, shotgun: 90, pistol: 90, archgun: 119.7, melee: 90 },
    'punch_through': { rifle: 2.7, shotgun: 2.7, pistol: 2.7, archgun: 2.7, melee: null },
    'puncture_damage': { rifle: 119.97, shotgun: 119.97, pistol: 119.97, archgun: 90, melee: 119.7 },
    'reload_speed': { rifle: 50, shotgun: 49.45, pistol: 50, archgun: 99.9, melee: null },
    'range': { rifle: null, shotgun: null, pistol: null, archgun: null, melee: 1.94 },
    'slash_damage': { rifle: 119.97, shotgun: 119.97, pistol: 119.97, archgun: 90, melee: 119.7 },
    'status_chance': { rifle: 90, shotgun: 90, pistol: 90, archgun: 60.3, melee: 90 },
    'status_duration': { rifle: 99.99, shotgun: 99, pistol: 99.99, archgun: 99.99, melee: 99 },
    'recoil': { rifle: 90, shotgun: 90, pistol: 90, archgun: 90, melee: null },
    'zoom': { rifle: 59.99, shotgun: null, pistol: 80.1, archgun: 59.99, melee: null }
  };

  const stat = baseValues[statUrlName];
  if (!stat) return null;

  return stat[weaponType] || null;
}

/**
 * Generates possible Riven names based on stats
 * @param {Array} stats Array of { value, matchedAttribute: { url_name } }
 * @param {string} weaponType - The weapon type (rifle, shotgun, pistol, archgun, melee)
 * @returns {Object} { recommended: string, others: string[] }
 */
export function generateRivenNames(stats, weaponType = null) {
  // Filter positive attributes with valid url_name
  const positiveStats = stats.filter(s => 
    s.type === 'positive' && 
    s.matchedAttribute && 
    s.matchedAttribute.url_name
  );

  if (positiveStats.length < 2) {
    return { recommended: '', others: [] };
  }

  // Sort by normalized value (value / base value) descending for the "recommended" logic
  const sortedByValue = [...positiveStats].sort((a, b) => {
    let normalizedA = Math.abs(a.value);
    let normalizedB = Math.abs(b.value);

    // If weaponType is provided, normalize by base value
    if (weaponType) {
      const baseA = getStatBaseValue(a.matchedAttribute.url_name, weaponType);
      const baseB = getStatBaseValue(b.matchedAttribute.url_name, weaponType);

      if (baseA && baseA !== 0) {
        normalizedA = Math.abs(a.value) / baseA;
      }
      if (baseB && baseB !== 0) {
        normalizedB = Math.abs(b.value) / baseB;
      }
    }

    return normalizedB - normalizedA;
  });
  
  let recommended = '';
  const others = new Set();

  if (positiveStats.length === 2) {
    // Rule: {Prefix}{Suffix} with Prefix = highest %
    // sortedByValue[0] is highest
    const prefix = getPrefix(sortedByValue[0].matchedAttribute.url_name);
    const suffix = getSuffix(sortedByValue[1].matchedAttribute.url_name);
    
    if (prefix && suffix) {
      recommended = capitalize(prefix + suffix.toLowerCase());
    }

    // Permutations (only 2 for 2 stats)
    // 1. A-Prefix B-Suffix (Recommended)
    // 2. B-Prefix A-Suffix
    const p1 = getPrefix(positiveStats[0].matchedAttribute.url_name);
    const s2 = getSuffix(positiveStats[1].matchedAttribute.url_name);
    if (p1 && s2) others.add(capitalize(p1 + s2.toLowerCase()));

    const p2 = getPrefix(positiveStats[1].matchedAttribute.url_name);
    const s1 = getSuffix(positiveStats[0].matchedAttribute.url_name);
    if (p2 && s1) others.add(capitalize(p2 + s1.toLowerCase()));

  } else if (positiveStats.length >= 3) {
    // Take top 3 if more than 3 (rare but possible in some contexts, strictly rivens have 2 or 3 positives)
    // Rule: {Prefix1}-{Prefix2}{Suffix}
    // Prefix1 = highest, Prefix2 = 2nd highest, Suffix = lowest (3rd)
    const top3 = sortedByValue.slice(0, 3);
    
    const p1 = getPrefix(top3[0].matchedAttribute.url_name);
    const p2 = getPrefix(top3[1].matchedAttribute.url_name);
    const s3 = getSuffix(top3[2].matchedAttribute.url_name);

    if (p1 && p2 && s3) {
      recommended = capitalize(`${p1}-${p2}${s3.toLowerCase()}`);
    }

    // Permutations of 3 items: 3! = 6
    // We need to generate all valid combinations of P-P-S
    const perms = getPermutations(positiveStats.slice(0, 3));
    perms.forEach(perm => {
      const pp1 = getPrefix(perm[0].matchedAttribute.url_name);
      const pp2 = getPrefix(perm[1].matchedAttribute.url_name);
      const ss3 = getSuffix(perm[2].matchedAttribute.url_name);
      
      if (pp1 && pp2 && ss3) {
        others.add(capitalize(`${pp1}-${pp2}${ss3.toLowerCase()}`));
      }
    });

    // Also add permutations of 2 items (P-S) using any pair from the 3 stats
    // This covers cases where one stat might be ignored or the user prefers a 2-stat name
    for (let i = 0; i < top3.length; i++) {
        for (let j = 0; j < top3.length; j++) {
            if (i === j) continue;
            const stat1 = top3[i];
            const stat2 = top3[j];
            
            const p = getPrefix(stat1.matchedAttribute.url_name);
            const s = getSuffix(stat2.matchedAttribute.url_name);
            
            if (p && s) {
                others.add(capitalize(p + s.toLowerCase()));
            }
        }
    }
  }

  // Remove recommended from others
  if (recommended) {
    others.delete(recommended);
  }

  return {
    recommended,
    others: Array.from(others)
  };
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    const remainingPerms = getPermutations(remaining);
    for (const perm of remainingPerms) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

/**
 * Parses Riven mod data from OCR text
 * @param {string} text - Raw OCR text
 * @param {Array} knownWeapons - Optional list of valid weapon names to fuzzy match against
 * @param {Array} knownAttributes - Optional list of valid attributes to match stats against
 * @returns {Object} Parsed Riven data
 */
export function parseRivenData(text, knownWeapons = [], knownAttributes = []) {
  console.log('Parsing Riven data from text:', text);
  
  const rivenData = {
    weaponName: null,
    stats: [],
    mastery: null,
    rolls: null,
    rawText: text
  };
  
  // Split text into lines for processing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  // Extract weapon name (usually first line or contains "Riven")
  rivenData.weaponName = extractWeaponName(lines, knownWeapons);
  
  // Find weapon name position in text to filter out stats before it
  let weaponNamePosition = -1;
  if (rivenData.weaponName) {
    const normalizedWeaponName = rivenData.weaponName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const textLines = text.split('\n');
    for (let i = 0; i < textLines.length; i++) {
      const normalizedLine = textLines[i].toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedLine.includes(normalizedWeaponName)) {
        // Calculate character position up to this line
        weaponNamePosition = textLines.slice(0, i).join('\n').length;
        break;
      }
    }
  }
  
  // Extract stats (look for +/- percentages)
  rivenData.stats = extractStats(text, weaponNamePosition);

  // Match stats to known attributes
  if (knownAttributes && knownAttributes.length > 0) {
    rivenData.stats.forEach(stat => {
      stat.matchedAttribute = findBestAttributeMatch(stat.name, knownAttributes);
      
      // Fix for stats where positive_is_negative is true (like Recoil and Reload Speed)
      // For these stats, we need to determine the correct type based on the attribute
      if (stat.matchedAttribute && stat.matchedAttribute.positive_is_negative === false) {
        // For reload speed (and other time-based stats), lower is better
        // If no explicit sign, values for reload speed should be negative
        const isTimeStat = stat.matchedAttribute.url_name === 'reload_speed';
        if (isTimeStat && !stat.hasExplicitSign) {
          // Reload speed without sign should be negative (debuff)
          stat.type = 'negative';
        }
      }
      
      // Fix for Recoil: Negative value is GOOD (Positive type), Positive value is BAD (Negative type)
      // extractStats sets type based on sign (+ -> positive, - -> negative)
      // So we need to invert it for Recoil ONLY if there was an explicit sign
      if (stat.matchedAttribute && stat.matchedAttribute.url_name === 'recoil') {
        // Only invert if the sign was explicit in OCR
        // Without explicit sign, we assume positive values (>= 1) are reductions (good)
        if (stat.hasExplicitSign) {
          stat.type = stat.type === 'positive' ? 'negative' : 'positive';
        }
        // else: keep the guessed type (value >= 1 -> positive = good = reduction)
      }
    });
  }
  
  // Fallback rule: Rivens can't have more than 3 positive stats
  // If we have 4 stats and 3+ are positive, and at least one doesn't have explicit sign,
  // convert the stat without explicit sign to negative
  if (rivenData.stats.length === 4) {
    const positiveStats = rivenData.stats.filter(s => s.type === 'positive');
    if (positiveStats.length > 3) {
      // Find the first positive stat without explicit sign
      const statToConvert = positiveStats.find(s => !s.hasExplicitSign);
      if (statToConvert) {
        console.log(`Applying fallback rule: Converting stat to negative (max 3 positives allowed): ${statToConvert.name}`);
        statToConvert.type = 'negative';
      }
    }
  }
  
  // Extract mastery requirement
  rivenData.mastery = extractMastery(text);
  
  // Extract rolls count
  rivenData.rolls = extractRolls(text);

  // Extract polarity
  rivenData.polarity = extractPolarity(text);

  // Fallback: If mastery or rolls are missing, try to find them based on position (below stats)
  if (rivenData.mastery === null || rivenData.rolls === null) {
    const footerData = extractFooterData(lines);
    if (rivenData.mastery === null) rivenData.mastery = footerData.mastery;
    if (rivenData.rolls === null) rivenData.rolls = footerData.rolls;
  }
  
  return rivenData;
}

/**
 * Calculates Levenshtein distance between two strings
 * @param {string} a 
 * @param {string} b 
 * @returns {number} Distance
 */
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  // increment along the first column of each row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // increment each column in the first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Extracts weapon name from text
 * @param {Array} lines - Text lines
 * @param {Array} knownWeapons - Optional list of known weapons
 * @returns {string|null} Weapon name
 */
function extractWeaponName(lines, knownWeapons = []) {
  if (!lines || lines.length === 0) return null;
  
  // Strategy: Scan lines to find the best matching weapon name.
  // We prioritize matches on longer weapon names to avoid false positives with short names (like "Bo") in noisy text.
  
  if (knownWeapons && knownWeapons.length > 0) {
    const allCandidates = [];

    // Scan more lines, as OCR noise can push the name down (e.g. line 11)
    // We scan up to 20 lines or all lines if fewer
    const linesToScan = lines.slice(0, 20);

    for (const line of linesToScan) {// Find candidates in this line
      const candidatesInLine = findWeaponCandidates(line, knownWeapons);
      allCandidates.push(...candidatesInLine);
    }

    if (allCandidates.length > 0) {
      // Sort globally: Longest name first, then best distance
      allCandidates.sort((a, b) => {
        if (b.length !== a.length) {
          return b.length - a.length; // Descending length
        }
        return a.dist - b.dist; // Ascending distance
      });

      return allCandidates[0].name;
    }
  }
  
  // If no "Riven" found, return first line as potential weapon name
  return lines[0].split('-')[0].trim();
}

/**
 * Finds all potential weapon matches in a raw string
 * @param {string} rawName 
 * @param {Array} knownWeapons 
 * @returns {Array} List of candidates {name, dist, length}
 */
function findWeaponCandidates(rawName, knownWeapons) {
  const candidates = [];
  const normalizedRaw = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (normalizedRaw.length < 2) return []; // Ignore too short lines

  for (const weapon of knownWeapons) {
    const weaponName = typeof weapon === 'string' ? weapon : weapon.item_name || weapon.url_name;
    if (!weaponName) continue;

    const normalizedWeapon = weaponName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Strategy 1: Exact prefix match
    if (normalizedRaw.startsWith(normalizedWeapon)) {
       candidates.push({
         name: weaponName,
         dist: 0,
         length: normalizedWeapon.length
       });
       continue;
    }

    // Strategy 2: Fuzzy prefix match (handles first char errors)
    const subExact = normalizedRaw.substring(0, normalizedWeapon.length);
    let distExact = levenshteinDistance(subExact, normalizedWeapon);
    
    // Strategy 3: Substring match (skip potential corrupted first chars)
    // Try matching from position 1 or 2 in case first char(s) are corrupted
    // Example: "Zrepticor" -> try matching "repticor" with "opticor"
    let distSubstring = Infinity;
    if (normalizedRaw.length > normalizedWeapon.length && normalizedWeapon.length > 4) {
      // Try skipping first char of raw string
      const sub1 = normalizedRaw.substring(1, normalizedWeapon.length + 1);
      const dist1 = levenshteinDistance(sub1, normalizedWeapon);
      distSubstring = Math.min(distSubstring, dist1 + 1); // +1 penalty for skipped char
      
      // For longer weapons, also try skipping 2 chars
      if (normalizedWeapon.length > 6) {
        const sub2 = normalizedRaw.substring(2, normalizedWeapon.length + 2);
        const dist2 = levenshteinDistance(sub2, normalizedWeapon);
        distSubstring = Math.min(distSubstring, dist2 + 2); // +2 penalty for 2 skipped chars
      }
    }
    
    // Strategy 4: Middle substring match (handles prefix corruption)
    // Check if middle part of weapon name exists in raw string
    // Example: "ptico" from "opticor" should match well in "zrepticor"
    let distMiddle = Infinity;
    if (normalizedRaw.length >= 5) {
      const weaponMiddle = normalizedWeapon.substring(1, normalizedWeapon.length - 1);
      if (normalizedRaw.includes(weaponMiddle)) {
        distMiddle = 1; // Found middle part, low penalty
      }
    }
    
    // Take best distance from all strategies
    let dist = Math.min(distExact, distSubstring, distMiddle);
    
    // Adjust threshold based on length
    let threshold;
    if (normalizedWeapon.length <= 3) {
      threshold = 0; // Exact match only for 2-3 char names like "Bo", "Uz"
    } else if (normalizedWeapon.length <= 6) {
      threshold = 1; // 1 error max for medium short
    } else {
      threshold = Math.floor(normalizedWeapon.length / 3); // Allow ~33% errors for long names
    }

    if (dist <= threshold) {
      candidates.push({
        name: weaponName,
        dist: dist,
        length: normalizedWeapon.length
      });
    }
  }
  return candidates;
}

/**
 * Extracts stats from text
 * @param {string} text - Raw text
 * @param {number} weaponNamePosition - Character position of weapon name in text, stats before this are ignored
 * @returns {Array} Array of stat objects
 */
function extractStats(text, weaponNamePosition = -1) {
  const stats = [];
  
  // Regex patterns for stats
  // Examples: "+120.5% Critical Chance", "-45.2% Fire Rate", "+0 4/Damage", "107 1% Multishot", "0 4 Damage to Infested"
  // Handles OCR errors like:
  // - spaces in numbers ("0 4" -> 0.4, "107 1" -> 107.1)
  // - missing %, or "/" instead of "%"
  // - missing +/- sign (treated as positive if value > 1, negative otherwise)
  // - OCR misreads of signs: "y" or "v" for "-", etc.
  const statPattern = /([+\-yv])?\s*((?:\d+(?:[.,\s]\d+)*))\s*[%/]?\s*([a-zA-Z].+?)(?=\n|$)/gi;
  
  let match;
  while ((match = statPattern.exec(text)) !== null) {
    // Filter: Skip stats that appear before the weapon name
    if (weaponNamePosition >= 0 && match.index < weaponNamePosition) {
      console.log(`Skipping stat before weapon name at position ${match.index}: "${match[0]}"`);
      continue;
    }
    let sign = match[1]; // Can be undefined if missing
    let rawValue = match[2];
    let statName = match[3].trim();
    
    // Normalize OCR sign errors: "y" or "v" are often misread "-" signs
    if (sign === 'y' || sign === 'v') {
      sign = '-';
    }
    
    // Filter 1: Skip if the statName contains a hyphen (likely weapon/riven name like "Visi-satipha")
    if (statName.includes('-')) {
      console.log(`Skipping stat with hyphen (likely weapon name): "${statName}"`);
      continue;
    }
    
    // Filter 2: Skip if statName is too long (likely captured wrong text)
    if (statName.length > 40) {
      console.log(`Skipping stat with too long name (${statName.length} chars): "${statName}"`);
      continue;
    }
    
    // Filter 3: Skip if statName looks like a proper name (multiple capitalized words)
    // BUT: Allow if it contains stat keywords (e.g., "Melee Damage" is valid even if capitalized)
    // Pattern: Word starting with capital, space, another word starting with capital
    // Examples to BLOCK: "Opticor Vandal", "Kuva Kohm", "Zrepticor Visi"
    // Examples to ALLOW: "Melee Damage", "Attack Speed", "Critical Chance"
    const properNamePattern = /^[A-Z][a-z]+\s+[A-Z]/;
    if (properNamePattern.test(statName)) {
      // Check if it contains stat keywords before blocking
      const statKeywords = [
        'damage', 'critical', 'status', 'multishot', 'fire', 'rate', 'reload', 'speed',
        'magazine', 'ammo', 'punch', 'range', 'heat', 'cold', 'electric', 'toxin',
        'slash', 'impact', 'puncture', 'infested', 'corpus', 'grineer', 'melee',
        'attack', 'channeling', 'combo', 'finisher', 'slide', 'recoil', 'recoll', 'zoom',
        'projectile', 'chance', 'duration', 'efficiency', 'maximum', 'capacity',
        'through', 'base', 'count', 'weapon'
      ];
      const hasStatKeyword = statKeywords.some(keyword => statName.toLowerCase().includes(keyword));
      
      if (!hasStatKeyword) {
        console.log(`Skipping stat that looks like proper name (no stat keywords): "${statName}"`);
        continue;
      }
    }
    
    // Filter 4: Skip if this looks like a rolls number after mastery rank
    // Pattern: "R16                 020" or "MR 14           O30" where the number should be recognized as rolls, not a stat
    // Strategy 1: Check if match appears right after mastery pattern in preceding text
    const textBeforeMatch = text.substring(Math.max(0, match.index - 100), match.index);
    const masteryPatternBefore = /(^|[^A-Z])M?R\s*\d+\s*$/i; // "R16", "R 16", "MR 14", "MR14", etc. at the end of the preceding text
    
    // Strategy 2: Check if the current line contains mastery pattern before the match
    // Extract the current line containing this match
    const lineStartIndex = text.lastIndexOf('\n', match.index) + 1;
    const lineEndIndex = text.indexOf('\n', match.index);
    const currentLine = text.substring(lineStartIndex, lineEndIndex === -1 ? text.length : lineEndIndex);
    const masteryPatternInLine = /M?R\s*\d+/i; // "R16", "MR 14", etc. anywhere in the line
    
    if (masteryPatternBefore.test(textBeforeMatch) || masteryPatternInLine.test(currentLine)) {
      // This number appears in a line with or right after a mastery pattern - likely the rolls number
      // Check if the statName is very short or doesn't contain stat keywords
      const containsStatKeyword = /damage|critical|status|multishot|fire|rate|reload|speed|magazine|ammo|punch|range|heat|cold|electric|toxin|slash|impact|puncture/i.test(statName);
      if (!containsStatKeyword) {
        console.log(`Skipping potential rolls number after mastery pattern: "${rawValue}" (${statName})`);
        continue;
      }
    }
    
    // Clean up value: handle OCR spacing errors
    // Examples: "107 1" -> "107.1", "4 107 1" -> "107.1" (drop leading digit if it creates invalid format)
    rawValue = rawValue.replace(/,/g, '.'); // Replace commas with dots
    
    // Handle space-separated decimals: "107 1" -> "107.1"
    // But be careful with cases like "4 107 1" where "4" is noise
    const parts = rawValue.split(/\s+/);
    if (parts.length === 2) {
      // Simple case: "107 1" -> "107.1"
      rawValue = parts[0] + '.' + parts[1];
    } else if (parts.length === 3) {
      // Complex case: "4 107 1" -> could be "4.107.1" or "107.1"
      // Heuristic: if first part is single digit and second part is 2-3 digits, skip first part
      if (parts[0].length === 1 && parts[1].length >= 2) {
        rawValue = parts[1] + '.' + parts[2];
      } else {
        rawValue = parts.join('.');
      }
    } else if (parts.length > 3) {
      // Very noisy, take last reasonable parts
      rawValue = parts.slice(-2).join('.');
    }
    
    let value = parseFloat(rawValue);
    
    // Filter 4: Skip very small values without explicit sign (likely noise)
    // Valid stats without signs are usually > 10 (e.g., "107.1% Multishot")
    // Small values like "4" or "0.4" should have explicit signs or be part of proper stat line
    if (!sign && value < 10 && !rawValue.includes('.')) {
      // Exception: if the statName contains common stat keywords, allow it
      const statKeywords = ['damage', 'critical', 'status', 'multishot', 'fire rate', 'reload', 'magazine', 'ammo', 'punch', 'range', 'heat', 'cold', 'electric', 'toxin', 'slash', 'impact', 'puncture', 'infested', 'corpus', 'grineer'];
      const hasStatKeyword = statKeywords.some(keyword => statName.toLowerCase().includes(keyword));
      
      if (!hasStatKeyword) {
        console.log(`Skipping suspicious low value without sign: ${value} "${statName}"`);
        continue;
      }
    }
    
    // Determine type based on sign or value
    let type;
    let hasExplicitSign = (sign === '-' || sign === '+');
    
    if (sign === '-') {
      type = 'negative';
    } else if (sign === '+') {
      type = 'positive';
    } else {
      // No sign: Heuristic based on value
      // Small values (< 1) or zero are typically negative stats
      // Large values (>= 1) are typically positive stats that lost the + sign
      type = value < 1 ? 'negative' : 'positive';
    }

    // Apply original value with sign
    if (type === 'negative' && value > 0) {
      value = -value; // Make it negative for display purposes? Actually, let's keep it positive but mark type
    }
    
    // Keep value positive, type indicates if it's good or bad
    value = Math.abs(value);

    stats.push({
      type: type,
      value: value,
      name: statName,
      hasExplicitSign: hasExplicitSign
    });
  }
  
  return stats;
}

/**
 * Extracts mastery requirement
 * @param {string} text - Raw text
 * @returns {number|null} Mastery rank
 */
function extractMastery(text) {
  // Look for patterns like "Mastery Rank 8" or "MR 8" or "Rank 8"
  const patterns = [
    /Mastery\s*Rank\s*(\d+)/i,
    /MR\s*(\d+)/i,
    /Rank\s*(\d+)/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

/**
 * Extracts roll count
 * @param {string} text - Raw text
 * @returns {number|null} Number of rolls
 */
function extractRolls(text) {
  // Look for patterns like "Rolled 5 times" or "5 rolls"
  // Added more robust patterns and common OCR error handling
  const patterns = [
    /Rolled\s*(\d+)\s*times?/i,
    /(\d+)\s*rolls?/i,
    /Rolled\s*:\s*(\d+)/i,
    /Rerolls\s*:\s*(\d+)/i,
    /Rolled\s*(\d+)/i // Just "Rolled 5"
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  // Fallback: Scan for lines with "roll" and try to extract number with OCR fixes
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.match(/roll/i)) {
      // Replace common OCR mix-ups for numbers
      const cleanLine = line.replace(/[oO]/g, '0')
                          .replace(/[lI|]/g, '1')
                          .replace(/[sS]/g, '5')
                          .replace(/[zZ]/g, '2')
                          .replace(/[g]/g, '9')
                          .replace(/[b]/g, '6'); // sometimes b is 6
      
      const match = cleanLine.match(/(\d+)/);
      if (match) {
        // Verify it's not a stat line (usually stats have %)
        if (!line.includes('%')) {
           return parseInt(match[1], 10);
        }
      }
    }
  }
  
  // Fallback 2: Look for MR pattern with rolls (e.g., "MR 16 04" or "MRS O01")
  // This handles the common pattern where rolls appear next to MR
  const mrRollsPattern = /MR[A-Z]?\s*\d+\s+([O0]?\d+)/i;
  const mrRollsMatch = text.match(mrRollsPattern);
  if (mrRollsMatch) {
    const rollsStr = mrRollsMatch[1].replace(/O/g, '0');
    return parseInt(rollsStr, 10);
  }
  
  return null;
}

/**
 * Extracts polarity from text if present
 * @param {string} text 
 * @returns {string|null} Polarity name or null
 */
function extractPolarity(text) {
  const polarities = ['madurai', 'vazarin', 'naramon', 'zenurik', 'unairu'];
  const lowerText = text.toLowerCase();
  
  for (const pol of polarities) {
    if (lowerText.includes(pol)) {
      return pol;
    }
  }
  
  // Check for common OCR misreads of symbols if they appear as single chars?
  // Hard to say without examples.
  
  return null;
}

/**
 * Scans lines below the last detected attribute to find Mastery and Rolls
 * Based on rule: "Mastery is always below the last attribute. the number right to it is the number of reroll."
 * @param {Array} lines - Array of text strings
 * @returns {Object} { mastery: number|null, rolls: number|null }
 */
function extractFooterData(lines) {
  let lastStatIndex = -1;
  const statLinePattern = /[+-]\s*\d+\.?\d*\s*%/;

  // Find the index of the last line that looks like a stat
  for (let i = 0; i < lines.length; i++) {
    if (statLinePattern.test(lines[i])) {
      lastStatIndex = i;
    }
  }

  // Start searching after the last stat found. If no stats found, scan the whole text (fallback)
  const startIndex = lastStatIndex === -1 ? 0 : lastStatIndex + 1;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Strategy 1: Look for "MR X Y" pattern where X is mastery and Y is rolls
    // This handles cases like "8 MR 9 02" or "MR 16 04"
    const mrPattern = /MR\s*(\d+)\s+(\d+)/i;
    const mrMatch = line.match(mrPattern);
    if (mrMatch) {
      const mr = parseInt(mrMatch[1], 10);
      const rolls = parseInt(mrMatch[2], 10);
      if (mr <= 18) {
        return { mastery: mr, rolls: rolls };
      }
    }
    
    // Strategy 2: Look for "MR X" at start/middle and number at end
    // This handles cases like "MRS O01" where OCR misread 0 as O
    const mrStartPattern = /MR[A-Z]?\s*([O0]\d+)/i;
    const mrStartMatch = line.match(mrStartPattern);
    if (mrStartMatch) {
      // Try to extract rolls from the OCR-corrupted number (O01 -> 01)
      const rollsStr = mrStartMatch[1].replace(/O/g, '0');
      const rolls = parseInt(rollsStr, 10);
      // MR not found in this pattern, keep looking
      return { mastery: null, rolls: rolls };
    }
    
    // Strategy 3: Look for a line with at least two numbers (e.g. "15 040")
    // This catches patterns like "VR 15 040 A" where 15 is MR and 040 is Rolls
    const numbers = line.match(/\d+/g);
    
    if (numbers && numbers.length >= 2) {
      // If line contains "MR", find the number after it
      if (/MR/i.test(line)) {
        // Find which number comes after "MR"
        const mrIndex = line.indexOf('MR');
        const afterMR = line.substring(mrIndex + 2);
        const afterNumbers = afterMR.match(/\d+/g);
        if (afterNumbers && afterNumbers.length >= 2) {
          const mr = parseInt(afterNumbers[0], 10);
          const rolls = parseInt(afterNumbers[1], 10);
          if (mr <= 18) {
            return { mastery: mr, rolls: rolls };
          }
        }
      } else {
        // Heuristic: First number is MR, second is Rolls
        // MR is typically between 8 and 18.
        const mr = parseInt(numbers[0], 10);
        const rolls = parseInt(numbers[1], 10);
        
        // Basic sanity check for MR to avoid picking up random large numbers
        if (mr <= 18) {
          return { mastery: mr, rolls: rolls };
        }
      }
    }
  }

  return { mastery: null, rolls: null };
}

/**
 * Validates parsed Riven data
 * @param {Object} rivenData - Parsed Riven data
 * @returns {Object} Validation result with errors
 */
export function validateRivenData(rivenData) {
  const errors = [];
  
  if (!rivenData.weaponName) {
    errors.push('Weapon name not found');
  }
  
  if (!rivenData.stats || rivenData.stats.length === 0) {
    errors.push('No stats found');
  }
  
  if (rivenData.stats && rivenData.stats.length > 4) {
    errors.push('Too many stats detected (max 4)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Formats Riven data for display
 * @param {Object} rivenData - Parsed Riven data
 * @returns {string} Formatted text
 */
export function formatRivenData(rivenData) {
  let output = '';
  
  if (rivenData.weaponName) {
    output += `Weapon: ${rivenData.weaponName}\n`;
  }
  
  if (rivenData.stats && rivenData.stats.length > 0) {
    output += '\nStats:\n';
    rivenData.stats.forEach(stat => {
      let sign;
      const isRecoil = (stat.matchedAttribute && stat.matchedAttribute.url_name === 'recoil') || 
                       (stat.name && stat.name.toLowerCase().includes('recoil'));
                       
      if (isRecoil) {
        // Recoil: Positive type (Good) means Negative value (-)
        sign = stat.type === 'positive' ? '-' : '+';
      } else {
        // Standard: Positive type (Good) means Positive value (+)
        sign = stat.type === 'positive' ? '+' : '-';
      }
      output += `  ${sign}${stat.value}% ${stat.name}\n`;
    });
  }
  
  if (rivenData.mastery !== null) {
    output += `\nMastery Rank: ${rivenData.mastery}\n`;
  }
  
  if (rivenData.rolls !== null) {
    output += `Rolls: ${rivenData.rolls}\n`;
  }
  
  return output;
}

/**
 * Calculates word-based match score between raw name and attribute
 * Returns number of matching words (higher is better)
 * @param {string} rawName 
 * @param {string} attrEffect 
 * @returns {number} Number of matching words
 */
function calculateWordMatchScore(rawName, attrEffect) {
  const rawWords = rawName.toLowerCase().split(/[\s/]+/).filter(w => w.length > 0);
  const attrWords = attrEffect.toLowerCase().split(/[\s/]+/).filter(w => w.length > 0);
  
  let matchCount = 0;
  for (const rawWord of rawWords) {
    // Check if this word appears in attribute (exact or fuzzy)
    for (const attrWord of attrWords) {
      if (rawWord === attrWord) {
        matchCount += 2; // Exact word match gets higher score
      } else if (attrWord.includes(rawWord) || rawWord.includes(attrWord)) {
        matchCount += 1; // Partial word match
      } else {
        // Fuzzy match for short edit distance
        const dist = levenshteinDistance(rawWord, attrWord);
        if (dist <= 1 && rawWord.length > 3) {
          matchCount += 1;
        }
      }
    }
  }
  
  return matchCount;
}

/**
 * Finds the best matching attribute for a given raw stat name
 * Priorities:
 * 1. Exact match (case insensitive)
 * 2. Word-based matching (prefers attributes where most words match)
 * 3. Inclusion (substring) - prefers smallest length difference
 * 4. Levenshtein distance - prefers smallest distance
 * 
 * @param {string} rawName 
 * @param {Array} knownAttributes 
 * @returns {Object|null} Best matching attribute or null
 */
function findBestAttributeMatch(rawName, knownAttributes) {
  if (!rawName || !knownAttributes) return null;
  
  const normalizedRaw = rawName.toLowerCase().trim();
  let bestMatch = null;
  let bestWordScore = 0;
  let bestDist = Infinity;

  for (const attr of knownAttributes) {
    const attrEffect = attr.effect.toLowerCase();
    
    // 1. Exact Match
    if (attrEffect === normalizedRaw) {
      return attr; // Best possible match, return immediately
    }
    
    // 2. Word-based matching (NEW - highest priority after exact match)
    const wordScore = calculateWordMatchScore(normalizedRaw, attrEffect);
    
    if (wordScore > bestWordScore) {
      bestWordScore = wordScore;
      bestMatch = attr;
      bestDist = Math.abs(attrEffect.length - normalizedRaw.length);
    } else if (wordScore === bestWordScore && wordScore > 0) {
      // Same word score, prefer shorter attribute (more specific)
      const currentDist = Math.abs(attrEffect.length - normalizedRaw.length);
      if (currentDist < bestDist) {
        bestMatch = attr;
        bestDist = currentDist;
      }
    }
  }
  
  // If we found a good word match (at least 2 points), return it
  if (bestWordScore >= 2) {
    return bestMatch;
  }
  
  // 3. Fallback: Inclusion-based matching
  bestMatch = null;
  bestDist = Infinity;
  let bestScoreType = 0;
  
  for (const attr of knownAttributes) {
    const attrEffect = attr.effect.toLowerCase();
    
    const isIncluded = attrEffect.includes(normalizedRaw) || normalizedRaw.includes(attrEffect);
    let isValidInclusion = false;

    if (isIncluded) {
      const minLen = Math.min(attrEffect.length, normalizedRaw.length);
      const maxLen = Math.max(attrEffect.length, normalizedRaw.length);
      const ratio = minLen / maxLen;
      
      if (ratio > 0.75) {
        isValidInclusion = true;
        if (bestScoreType < 2) {
          bestScoreType = 2;
          bestMatch = attr;
          bestDist = Math.abs(attrEffect.length - normalizedRaw.length);
        } else if (bestScoreType === 2) {
          const diff = Math.abs(attrEffect.length - normalizedRaw.length);
          if (diff < bestDist) {
            bestMatch = attr;
            bestDist = diff;
          }
        }
      }
    }

    if (isValidInclusion) {
      continue;
    }
    
    // 4. Levenshtein Distance
    if (bestScoreType < 2) {
      const dist = levenshteinDistance(normalizedRaw, attrEffect);
      if (dist < bestDist) {
        bestScoreType = 1;
        bestMatch = attr;
        bestDist = dist;
      }
    }
  }
  
  return bestMatch;
}
