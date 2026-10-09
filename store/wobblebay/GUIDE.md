# Wobble Bay

An original single-player 3D physics sandbox for PocketVM, inspired by the playful exploration and jobs in [Wobbly Life](https://www.rubberbandgames.com/). It uses original characters, a new island and procedural artwork. It does not include the Xbox game's maps, assets, story or multiplayer.

Borrow a parked vehicle, pick up a job at the town board or explore freely. Eight repeatable jobs pay for hats, seven garage vehicles, three houses and Biscuit the dog. Sixteen hidden stars reward exploration. Cash, purchases, colours, completed jobs and preferences save automatically. Job clocks and physics pause when a menu opens or the game loses focus.

| Input | Keyboard | iPad | Xbox controller |
|---|---|---|---|
| Move / drive | WASD or arrows | Left joystick | Left stick |
| Look | Drag the world | Swipe with another finger | Right stick |
| Interact / enter / exit | E | ACT | Y |
| Grab / drop | G | GRAB | X |
| Throw | R | THROW | Right bumper |
| Jump / boost / helicopter up | Space | JUMP / BOOST / UP | A |
| Flop / brake / helicopter down | F | FLOP / BRAKE / DOWN | B |
| Run | Shift | Full joystick travel | Left stick click |
| Map | M | MAP / minimap | Back |
| Jobs | J | JOBS | Use the job board |
| Pause | Esc or P | Pause button | Start |

The touch layout adapts to portrait, landscape and split view. Settings offers Large or Extra large buttons, an option to always show touch controls, graphics quality, camera distance, sound and five lighting choices including Random.

| Job | What actually completes it |
|---|---|
| Parcel Run | Pick up and deliver three physical parcels. Enter a car while holding one to load it. |
| Pizza Express | Collect and deliver three pizza boxes, with a bonus for finishing quickly. |
| Taxi, Please! | Borrow the yellow taxi, board and drop off three passengers with ACT. |
| Park Patrol | Grab four rubbish bags and drop or throw them into the recycling zone. |
| Gone Fishing | Reach the pier, ACT to cast, then GRAB during each of three bite windows. |
| Builder Buddy | Bring three material crates to the orange foundation. Also awards a hard hat. |
| Island Rally | Drive through eight ordered checkpoint rings. |
| Coastal Rescue | Fly to the offshore island, land, board the castaway and return to the clinic. |

Grabbed objects follow damped springs. Loose objects bounce, collide and exchange impulses; vehicles can knock them away. Cars exchange momentum and spin in crashes. Characters tumble with constrained ragdoll joints and get up again. Lost job cargo returns to its pickup; recovery keeps earned progress. Parked vehicles are free, and purchased vehicles can be called from the garage.

The Store installs the HTML, physics engine, presentation and software graphics scripts and vendored Three.js r160 together, verifies each file and embeds scripts into its sandbox. WebGL handles normal 3D graphics. A perspective software renderer uses the same scene and camera when WebGL is unavailable, with simpler geometry and no dynamic shadows. No CDN, login or paid backend is required. [Three.js](https://github.com/mrdoob/three.js/tree/r160) is used under its included MIT licence.

Validation: `node tests/wobble-regression.cjs` exercises the shipped physics and pilots all eight jobs using ordinary controls; `node tests/wobble-package.cjs` checks installation, offline launch, save validation, repair, rollback and icon migration. `tests/wobble-touch-layout.html` checks the actual rendered game's touch control geometry at six phone/tablet sizes.
