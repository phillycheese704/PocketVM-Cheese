# Deadwave — Arsenal v2

This expansion preserves the original six weapons, 43 cards, nine regular zombie breeds and three bosses. It adds **seven weapons, 93 cards (seven weapon cards and 86 passive upgrades), ten regular zombie breeds and five bosses**. Totals: 13 weapons, 136 cards, 19 regular breeds and eight bosses.

| New weapon | Combat behavior |
| --- | --- |
| Flamethrower | Short-range piercing flame jets and damage over time |
| Cryo Cannon | Three slowing shards; repeated frost hits freeze targets |
| Tesla Coil | Instant lightning that chains to nearby enemies |
| Grenade Launcher | Contact/fuse explosions; fragmentation upgrade |
| Ripsaw Launcher | Piercing discs return for another pass |
| Rail Cannon | Instant line attacks; delayed echo upgrade |
| Plasma Caster | Homing explosive orbs |

The ten new regular breeds are Riot Husk, Crawl Fiend, Acid Spitter, Frost Walker, Ram Brute, Howler, Grave Diver, Spore Carrier, Blood Leech and Storm Revenant. They unlock gradually from waves 4–14. They introduce frontal shields, low crawling attacks, marked acid pools, slows, warned charges, ally buffs, marked burrows, split spawns, shield drains and marked lightning strikes.

Boss debuts: King 5, Necromancer 10, Titan 15, Butcher 20, Broodmother 25, Storm Lord 30, Glacier Colossus 35 and Void Reaper 40. Later boss waves draw from a shuffled pool. New bosses intensify below half health. The wave clock can reach zero, but players must defeat the boss before receiving cards. Spawning and ability timers use simulation time and stop during pause.

Cards cover core stats, burns, frost, bleeding, chain lightning, ricochets, blast effects, executions, boss damage, shields, dodges, reflection, thorns, drones, pulses, mines, orbitals, recovery, conditional damage, weapon mastery and cursed tradeoffs. Mastery cards require the equipped weapon. Stack limits and caps prevent unusable offers; rarity selection is independent of the expanded pool size. Weapon cards receive a dedicated discovery chance after early waves.

Artwork uses newly drawn Canvas models: articulated limbs, shaded faces, clothing and breed-specific equipment, distinct weapon silhouettes, muzzle flashes, status outlines, projectile effects, telegraphs and boss health displays. No external sprite downloads are needed. The menu's searchable field guide lists every weapon, card, breed and boss.

Validation: `node tests/games-regression.cjs` with Node and `@napi-rs/canvas`. Tests execute the production engines and renderers, injecting accessors only into in-memory test copies. Coverage includes exact content counts, every card and weapon, swept projectile collisions, statuses, defenses, autonomous abilities, mutant behavior, boss gating, pause, legal draft offers, frame timing, all models and three seeded opening runs using normal HP and legal card choices.
