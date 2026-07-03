#!/usr/bin/env node
/**
 * Seed CHI 2026 Smell network example — Awu Chen's conference memory graph.
 *
 * Scenario:
 * - Awu Chen co-presenting Smell interactivity with Genji at CHI '26
 * - Demo booth: met Joefish Kaye, Judith Amores, Jas Brooks
 * - Workshop "Follow Your Nose" (UCL): met Marianna Obrist, Chih-Hung Lee
 *
 * Usage:
 *   node scripts/seed-chi26-smell-example.js
 *   node scripts/seed-chi26-smell-example.js --clean   # remove prior sample data first
 */

const path = require('path');
const fs = require('fs');
const neo4j = require(path.join(__dirname, '../react-graph-viz/node_modules/neo4j-driver'));

const DEFAULTS = {
  uri: 'neo4j+s://8742d753.databases.neo4j.io',
  user: '8742d753',
  password: 'hP2TGZzheO0Nw0BIqjnn1_jWaexvnbtPZFuoclY4oHg',
  database: '8742d753',
};

const SAMPLE_NAMES_TO_REMOVE = [
  'Alice Chen', 'Bob Smith', 'Carol Davis', 'Dana Kim',
  'Evan Torres', 'Fiona Lee', 'Grace Patel', 'Henry Wu',
];

// CHI 2026 — demo booth day (Wed) and workshop day (Thu), local-ish timestamps
const CHI26_DEMO_DAY = new Date('2026-04-15T15:30:00-07:00').getTime();
const CHI26_WORKSHOP_DAY = new Date('2026-04-16T10:15:00-07:00').getTime();

const ATTENDEES = [
  {
    name: 'Awu Chen',
    affiliation: 'MIT Media Lab',
    email: 'awu@media.mit.edu',
    location: 'Cambridge, MA',
    stickers: ['presenter', 'interactivity'],
    orderId: 1,
    createdAt: new Date('2026-04-13T09:00:00-07:00').getTime(),
  },
  {
    name: 'Genji',
    affiliation: 'MIT Media Lab',
    email: 'genji@media.mit.edu',
    location: 'Cambridge, MA',
    stickers: ['presenter', 'interactivity'],
    orderId: 2,
    createdAt: CHI26_DEMO_DAY - 3600000,
  },
  {
    name: 'Joefish Kaye',
    affiliation: 'Google',
    email: 'joefish@google.com',
    location: 'San Francisco, CA',
    stickers: ['presenter'],
    orderId: 3,
    createdAt: CHI26_DEMO_DAY,
  },
  {
    name: 'Judith Amores',
    affiliation: 'MIT Media Lab',
    email: 'jamores@media.mit.edu',
    location: 'Cambridge, MA',
    stickers: ['presenter'],
    orderId: 4,
    createdAt: CHI26_DEMO_DAY,
  },
  {
    name: 'Jas Brooks',
    affiliation: 'MIT Media Lab',
    email: 'jas@media.mit.edu',
    location: 'Chicago, IL',
    stickers: ['presenter'],
    orderId: 5,
    createdAt: CHI26_DEMO_DAY,
  },
  {
    name: 'Marianna Obrist',
    affiliation: 'University College London',
    email: 'm.obrist@ucl.ac.uk',
    location: 'London, UK',
    stickers: ['presenter'],
    orderId: 6,
    createdAt: CHI26_WORKSHOP_DAY,
  },
  {
    name: 'Chih-Hung Lee',
    affiliation: 'Tsinghua Future Laboratory',
    email: 'leechihhung@tsinghua.edu.cn',
    location: 'Beijing, China',
    stickers: ['presenter'],
    orderId: 7,
    createdAt: CHI26_WORKSHOP_DAY,
  },
];

/** Awu Chen's memory edges (owner → person they met) */
const AWU_CONNECTIONS = [
  {
    target: 'Genji',
    context: 'demo',
    impact: 5,
    note: 'Co-presenting our Smell interactivity at CHI \'26 — shared the booth all afternoon.',
    createdAt: CHI26_DEMO_DAY - 1800000,
  },
  {
    target: 'Joefish Kaye',
    context: 'demo',
    impact: 4,
    note: 'Stopped by our smell demo booth — great conversation about embodied interaction and sensory design.',
    createdAt: CHI26_DEMO_DAY + 900000,
  },
  {
    target: 'Judith Amores',
    context: 'demo',
    impact: 5,
    note: 'Met at our demo booth while presenting Smell interactivity. Talked about multisensory memory and spatial smell.',
    createdAt: CHI26_DEMO_DAY + 1800000,
  },
  {
    target: 'Jas Brooks',
    context: 'demo',
    impact: 5,
    note: 'Connected at the booth over shared smell HCI interests — Jas had sharp questions about the interactivity demo.',
    createdAt: CHI26_DEMO_DAY + 2700000,
  },
  {
    target: 'Marianna Obrist',
    context: 'session',
    impact: 5,
    note: 'Follow Your Nose workshop (UCL): Experiencing Smell as a Design Material. Discussed Sniff AI — https://arxiv.org/abs/2411.06950',
    createdAt: CHI26_WORKSHOP_DAY + 3600000,
  },
  {
    target: 'Chih-Hung Lee',
    context: 'session',
    impact: 5,
    note: 'Same smell workshop. Chih-Hung presenting BernO at CHI — https://programs.sigchi.org/chi/2026/program/content/222878. Tsinghua Future Laboratory smell work.',
    createdAt: CHI26_WORKSHOP_DAY + 5400000,
  },
];

function getConfig() {
  return {
    uri: process.env.REACT_APP_NEO4J_URI || process.env.NEO4J_URI || DEFAULTS.uri,
    user: process.env.REACT_APP_NEO4J_USERNAME || process.env.NEO4J_USER || DEFAULTS.user,
    password: process.env.REACT_APP_NEO4J_PASSWORD || process.env.NEO4J_PASSWORD || DEFAULTS.password,
    database: process.env.REACT_APP_NEO4J_DATABASE || process.env.NEO4J_DATABASE || DEFAULTS.database,
  };
}

async function seed() {
  const clean = process.argv.includes('--clean');
  const { uri, user, password, database } = getConfig();
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session({ database });

  try {
    if (clean) {
      await session.run(
        `MATCH (u:User)
         WHERE u.name IN $names
         DETACH DELETE u`,
        { names: SAMPLE_NAMES_TO_REMOVE }
      );
      console.log('Removed prior sample attendees.');
    }

    for (const person of ATTENDEES) {
      await session.run(
        `MERGE (u:User {name: $name})
         SET u.affiliation = $affiliation,
             u.email = $email,
             u.location = $location,
             u.stickers = $stickers,
             u.orderId = $orderId,
             u.createdAt = $createdAt,
             u.role = $affiliation,
             u.website = $email`,
        person
      );
      console.log(`User: ${person.name} [${person.stickers.join(', ')}]`);
    }

    const owner = 'Awu Chen';
    for (const conn of AWU_CONNECTIONS) {
      await session.run(
        `MATCH (owner:User {name: $owner})
         MATCH (target:User {name: $target})
         MERGE (owner)-[r:CONNECTED_TO]->(target)
         SET r.note = $note,
             r.context = $context,
             r.impact = $impact,
             r.createdAt = $createdAt`,
        {
          owner,
          target: conn.target,
          note: conn.note,
          context: conn.context,
          impact: conn.impact,
          createdAt: conn.createdAt,
        }
      );
      console.log(`  → ${conn.target} (${conn.context}, impact ${conn.impact})`);
    }

    console.log('\nCHI \'26 Smell example seeded.');
    console.log('NFC badge URL for Awu Chen:');
    console.log('  https://awuchen.github.io/CHIMemories/#/Awu Chen');
    console.log('Set phone owner to "Awu Chen" (tap own badge once) to explore this memory graph.');
  } finally {
    await session.close();
    await driver.close();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
