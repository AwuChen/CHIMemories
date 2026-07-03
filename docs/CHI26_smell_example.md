# CHI 2026 Smell Network — Example Memory Graph

Real pilot example centered on **Awu Chen** at CHI '26.

## People

| Name | Affiliation | Stickers | How Awu met them |
|------|-------------|----------|------------------|
| Awu Chen | MIT Media Lab | Presenter, Interactivity | — (you) |
| Genji | MIT Media Lab | Presenter, Interactivity | Co-presenting Smell interactivity |
| Joefish Kaye | Google | Presenter | Demo booth |
| Judith Amores | MIT Media Lab | Presenter | Demo booth |
| Jas Brooks | MIT Media Lab | Presenter | Demo booth |
| Marianna Obrist | University College London | Presenter | *Follow Your Nose* workshop (UCL) |
| Chih-Hung Lee | Tsinghua Future Laboratory | Presenter | *Follow Your Nose* workshop |

## Awu's memories (sample notes)

**Demo booth** (context: `demo`)
- **Genji** — Co-presenting Smell interactivity at CHI '26
- **Joefish Kaye** — Conversation about embodied interaction and sensory design
- **Judith Amores** — Multisensory memory and spatial smell
- **Jas Brooks** — Shared smell HCI interests at the interactivity demo

**Workshop:** *Follow Your Nose: Experiencing Smell as a Design Material* (UCL)  
(context: `session`)
- **Marianna Obrist** — Sniff AI: https://arxiv.org/abs/2411.06950
- **Chih-Hung Lee** — BernO at CHI '26: https://programs.sigchi.org/chi/2026/program/content/222878

## Seed the database

```bash
node scripts/seed-chi26-smell-example.js --clean
```

`--clean` removes the old fictional sample attendees (Alice Chen, Bob Smith, etc.) before seeding.

## Try it in the app

1. Open the app and tap an NFC badge programmed with `#/Awu Chen`, or visit `#/Awu Chen` in the browser.
2. Confirm **Yes, this is me** to link your phone as Awu Chen.
3. Tap **My Memory** or tap your badge again to see stickers and connection notes.
4. Open the graph — demo connections show in demo context color; workshop connections in session color.
5. Use **Timeline** to replay demo day → workshop day.

## Badge URLs

```
https://awuchen.github.io/CHIMemories/#/Awu Chen
https://awuchen.github.io/CHIMemories/#/Genji
https://awuchen.github.io/CHIMemories/#/Joefish Kaye
https://awuchen.github.io/CHIMemories/#/Judith Amores
https://awuchen.github.io/CHIMemories/#/Jas Brooks
https://awuchen.github.io/CHIMemories/#/Marianna Obrist
https://awuchen.github.io/CHIMemories/#/Chih-Hung Lee
```
