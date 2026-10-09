# Adventure v15 gameplay balance

The Adventure engine now uses waves with point budgets rather than choosing a
random advanced zombie every few seconds. All 50 stage wave counts and enemy
availability masks, all 49 plant costs and seed recharge times, zombie point
costs, first-wave gates and selection weights were checked against the original
game's behavior tables. New enemy introductions get their scheduled appearance.

Normal waves wait 25–31 seconds. After at least four seconds, reducing the latest
wave to 50–65% of its starting health brings the next wave closer. Flag attacks
get a 7.5-second warning, larger budgets, a flag zombie, and visible HUD markers.
Final-wave completion waits for queued spawns and hostile survivors. Night
gravestones produce zombies during the final attack; the final Pool/Fog attack
includes a delayed pool ambush. Fog no longer incorrectly contains gravestones.

| Stage | Format | Waves | Huge flag attacks |
| --- | --- | ---: | ---: |
| 1-10 | Day conveyor | 20 | 2 |
| 2-10 | Night conveyor | 20 | 2 |
| 3-10 | Pool conveyor | 30 | 3 |
| 4-10 | Dark Stormy Night conveyor | 20 | 2 |
| 5-10 | Zomboss roof conveyor | Phased boss | Boss phases |

Conveyor recipes and base weights follow the original Adventure decks. Supply
slows when packets accumulate; support and duplicate packets receive lower
weights, and Grave Busters stop arriving when no usable graves remain. Opening
packets provide usable defenders and supports. The boss has 40,000 HP, alternates
between summoning and exposed-head phases, and launches rolling fire/ice attacks.
Ice-shroom is awake on the boss roof and counters fire; a Jalapeno in the attacked
lane counters ice. Only the exposed head takes direct plant damage.

Combat corrections include 15-second mine arming, 4.5-second Grave Busters,
42-second Chomper chewing, four Gloom-shroom pulses, 15-second Magnet-shroom
recovery, correct medium/long seed recharge, longer sun collection time, and
original-style sun production intervals. Special zombie corrections include
helmet/body balance, slower bites while chilled, timed Pogo jumps, Gargantuar
smash windup, Catapult's 75-damage shots and finite ammunition, Zomboni ice trails,
and Spikerock durability. Tiny zombies have quarter health with normal movement
and bite pacing. Bungee Blitz thefts occur on flag waves, use distinct targets,
and preserve underlying roof pots.

Frame updates advance in simulation steps of at most 50 ms, catching up to
500 ms per rendered frame. This keeps combat and the preparation countdown
consistent at lower frame rates without skipping collisions. Pause and stage
changes still stop pending updates.

The existing 30-second preparation period, basic opening enemies, early Endless
unlock, Day/Night Endless rotation, custom ending, saves, and corrected Peashooter
artwork remain part of PocketVM's design.

## Reference and validation

Behavior values were compared with the original-game reconstruction at
[Patoke/re-plants-vs-zombies, c469203](https://github.com/Patoke/re-plants-vs-zombies/tree/c4692036c5e11d227c8fb7c593b734dac96da028),
particularly `Lawn/Board.cpp`, `Lawn/Challenge.cpp`, `Lawn/Plant.cpp`,
`Lawn/Zombie.cpp`, and `Lawn/Projectile.cpp`.

Run `node tests/pvz-regression.cjs` from the repository root with
`@napi-rs/canvas` installed. The 65 checks include all stage startup renders,
plant/zombie artwork, wave behavior, combat interactions, and 13 complete matches
using real starting resources and packet supplies. Each world finale clears in a
deterministic full-match fixture; the match timings and resources are recorded in
[`tests/pvz-balance-matches.json`](../../tests/pvz-balance-matches.json).

These fixtures establish repeatable working strategies, not a human win-rate
measurement or a complete playthrough of every stage and random seed. Exploratory
Tiny/Bungee bot runs can still lose. Native animation timing, the full original
special-zombie state machines, and Zomboss RV/stomp choreography remain simplified;
this is a closer gameplay reconstruction, not a frame-perfect port.
