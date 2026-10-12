# Swarm Sim

Original PocketVM idle colony inspired by the classic browser Swarm Simulator. The production and purchase structure uses 20 meat producer tiers, 11 territory units, sacrifice costs, faster/twin upgrades, hatcheries, expansions, five nexus, six energy spells, cocoon storage, energy-specialist creatures, ten permanent mutations and ascension. Opening balance is 35 meat, 10 larvae and 1 larva/second. Original illustration, insect icons and interface; no source code or art copied from Swarm Simulator. Numeric balance reference: developer's published data at https://github.com/swarmsim/swarm and game at https://www.swarmsim.com/.

Buy quantities 1, 10, 100, 25% affordable or Maximum. Costs show which lower-tier creatures will be sacrificed. Purchases can be undone for ten seconds while retaining elapsed production. Keyboard 1–6 selects sections, U undoes, Escape closes review. Large touch targets, responsive layouts, number notation and still-art option.

Production integrates the whole chain analytically for active time, offline time (up to one year) and Swarmwarp. Energy is capped and not produced during a warp. Backups export/import as JSON with a review before replacement. Lifetime journal persists across ascension. Original local single-player game: no online leaderboard or purchases. Quantities are bounded at 1e250 to keep long-term saves finite and portable. Respec refunds mutation investments but never category unlock costs.

Three native .pvmod packages change meat, larvae or energy production and keep isolated saves. Store verifies package bytes, embeds all JavaScript offline, and source-checks/sanitizes career messages.
