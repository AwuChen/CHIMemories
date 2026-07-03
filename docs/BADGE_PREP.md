# CHI Badge Preparation Guide

## NFC URL format

Program each badge NFC chip (NTAG213 or similar) with a URL record pointing to:

```
https://awuchen.github.io/CHIMemories/#/{Full Name}
```

Examples:

- `https://awuchen.github.io/CHIMemories/#/Alice Chen`
- `https://awuchen.github.io/CHIMemories/#/Bob Smith`

Use the exact name from `Excel/CHI_attendee_roster.csv` — names are title-cased on tap but should match the roster for pre-seeded profile data.

## Physical stickers

Apply visual stickers to each badge matching the `Stickers` column in the roster CSV:

| Sticker ID | Label |
|------------|-------|
| `first_chi` | First CHI |
| `presenter` | Presenter |
| `interactivity` | Interactivity |
| `rejected_author` | Rejected Author |
| `student` | Student |
| `volunteer` | Volunteer |
| `sponsor` | Sponsor |

Sticker data is pre-seeded in Neo4j via the import script and revealed when someone taps the badge or views the person in the graph.

## Pre-event setup

1. Import roster: `node scripts/import-roster.js Excel/CHI_attendee_roster.csv`
2. Program NFC tags with per-person URLs
3. Apply physical stickers to badges
4. Deploy app to GitHub Pages: `cd react-graph-viz && npm run deploy`

## Attendee instructions

1. **First tap:** Tap your own badge once → confirm "Yes, this is me" to link your phone.
2. **Meet someone:** Tap their badge → optionally capture a memory note → connection appears in your graph.
3. **View your memory:** Tap your own badge again (or open My Memory) to see stickers and connection history.

## Reset phone

If a phone is linked to the wrong person, visit `#/reset` or tap "Reset Phone" in the app.
