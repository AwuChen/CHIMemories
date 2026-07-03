#!/usr/bin/env node
/**
 * Import CHI attendee roster CSV into Neo4j.
 *
 * Usage:
 *   node scripts/import-roster.js Excel/CHI_attendee_roster.csv
 *
 * Requires neo4j-driver (from react-graph-viz/node_modules) and env overrides
 * or defaults from react-graph-viz/src/neo4jConfig.js.
 */

const fs = require('fs');
const path = require('path');

const neo4j = require(path.join(__dirname, '../react-graph-viz/node_modules/neo4j-driver'));

const DEFAULTS = {
  uri: 'neo4j+s://8742d753.databases.neo4j.io',
  user: '8742d753',
  password: 'hP2TGZzheO0Nw0BIqjnn1_jWaexvnbtPZFuoclY4oHg',
  database: '8742d753',
};

function getConfig() {
  return {
    uri: process.env.REACT_APP_NEO4J_URI || process.env.NEO4J_URI || DEFAULTS.uri,
    user: process.env.REACT_APP_NEO4J_USERNAME || process.env.NEO4J_USER || DEFAULTS.user,
    password: process.env.REACT_APP_NEO4J_PASSWORD || process.env.NEO4J_PASSWORD || DEFAULTS.password,
    database: process.env.REACT_APP_NEO4J_DATABASE || process.env.NEO4J_DATABASE || DEFAULTS.database,
  };
}

function parseCsv(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

function capitalizeWords(str) {
  if (!str) return str;
  return str.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function parseStickers(stickerStr) {
  if (!stickerStr) return [];
  return stickerStr.split(',').map((s) => s.trim()).filter(Boolean);
}

async function importRoster(csvPath) {
  const absolutePath = path.resolve(csvPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  const rows = parseCsv(fs.readFileSync(absolutePath, 'utf8'));
  const { uri, user, password, database } = getConfig();
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session({ database });
  const timestamp = Date.now();

  try {
    for (const row of rows) {
      const name = capitalizeWords(row.Name);
      const stickers = parseStickers(row.Stickers);
      const orderId = parseInt(row.ID, 10) || null;

      await session.run(
        `MERGE (u:User {name: $name})
         ON CREATE SET u.createdAt = $timestamp
         SET u.affiliation = $affiliation,
             u.email = $email,
             u.location = $location,
             u.stickers = $stickers,
             u.orderId = $orderId,
             u.role = coalesce(u.role, $affiliation),
             u.website = coalesce(u.website, $email)`,
        {
          name,
          affiliation: row.Affiliation || '',
          email: row.Email || '',
          location: row.Location || '',
          stickers,
          orderId,
          timestamp,
        }
      );
      console.log(`Imported: ${name} [${stickers.join(', ')}]`);
    }
    console.log(`\nDone. Imported ${rows.length} attendees.`);
  } finally {
    await session.close();
    await driver.close();
  }
}

const csvArg = process.argv[2] || path.join(__dirname, '../Excel/CHI_attendee_roster.csv');
importRoster(csvArg).catch((err) => {
  console.error(err);
  process.exit(1);
});
