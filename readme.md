# CHI Memories

Conference memory tracking built on the TechFestNet architecture: React + Neo4j Aura + NFC badge URLs + live force-graph visualization.

Repurposed from [TechFestNet](https://github.com/AwuChen/TechFestNet) to capture who you meet at CHI, sticker identity on badges, and post-tap memory notes.

## Neo4j

Connection defaults are in `react-graph-viz/src/neo4jConfig.js` (Aura **8742d753**, database name aligned with the Query API `/db/8742d753/`). Override with `REACT_APP_NEO4J_URI`, `REACT_APP_NEO4J_USERNAME`, `REACT_APP_NEO4J_PASSWORD`, `REACT_APP_NEO4J_DATABASE` in `react-graph-viz/.env` before `npm run build` / deploy. Keep `Cred/Neo4j-CHIMemories-Aura.txt` in sync.

The main app lives in `react-graph-viz/`. Use `npm install` and `npm start` there for local development.

## Roster import

Pre-seed attendees and stickers before the event:

```bash
cd react-graph-viz
node ../scripts/import-roster.js ../Excel/CHI_attendee_roster.csv
```

Seed the CHI '26 Smell example (Awu Chen's demo + workshop memory graph):

```bash
node scripts/seed-chi26-smell-example.js --clean
```

See [`docs/CHI26_smell_example.md`](docs/CHI26_smell_example.md) for the full scenario.

## NFC badge URLs

Program each badge NFC chip with:

```
https://awuchen.github.io/CHIMemories/#/{Full Name}
```

See `docs/BADGE_PREP.md` for full badge preparation instructions.
