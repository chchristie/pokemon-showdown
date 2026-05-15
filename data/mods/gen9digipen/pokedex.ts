// DigiPen custom Pokémon definitions.
//
// HOW TO ADD CONTENT:
//
// ── Custom Pokémon ──────────────────────────────────────────────────────────
// Add a new entry keyed by the Pokémon's ID (lowercase, no spaces/punctuation).
// All new DigiPen Pokémon MUST include `isNonstandard: "DigiPen"`. This marker
// ensures they are illegal in every non-DigiPen format.
//
// Example:
//   digipenmon: {
//     num: 2000,
//     name: "DigipenMon",
//     isNonstandard: "DigiPen",
//     types: ["Fairy", "Steel"],
//     baseStats: { hp: 80, atk: 80, def: 80, spa: 80, spd: 80, spe: 80 },
//     abilities: { 0: "Levitate", 1: "Technician", H: "Magician" },
//     heightm: 1.0,
//     weightkg: 30.0,
//     color: "Blue",
//     eggGroups: ["Undiscovered"],
//   },
//
// ── Regional Forms ──────────────────────────────────────────────────────────
// Regional forms are separate entries whose `baseSpecies` points at the
// canonical Pokémon and whose `forme` field names the region
// (e.g. "Alola", "Hisui", "DigiPen"). Remember to add the form ID to the
// base Pokémon's `otherFormes` / `formeOrder` lists via `inherit: true`.
//
// Example:
// Step 1 – add the form entry:
//   pikachudigipen: {
//     num: 25,
//     name: "Pikachu-DigiPen",
//     isNonstandard: "DigiPen",
//     baseSpecies: "Pikachu",
//     forme: "DigiPen",
//     types: ["Electric", "Fairy"],
//     baseStats: { hp: 50, atk: 85, def: 50, spa: 85, spd: 55, spe: 110 },
//     abilities: { 0: "Lightning Rod" },
//     heightm: 0.5,
//     weightkg: 6.5,
//     color: "Yellow",
//     eggGroups: ["Undiscovered"],
//   },
//
// Step 2 – patch the base species to advertise the form:
//   pikachu: {
//     inherit: true,
//     otherFormes: ["Pikachu-Original", ..., "Pikachu-DigiPen"],
//     formeOrder: ["Pikachu", "Pikachu-Original", ..., "Pikachu-DigiPen"],
//   },
//
// ── Mega Evolutions ─────────────────────────────────────────────────────────
// Mega Evolutions are forme entries with `requiredItem: "<MegaStone>"`.
// The base Pokémon's entry needs `otherFormes` / `formeOrder` updated
// (use `inherit: true` to patch the existing entry without overwriting it).
// Don't forget to patch the base entry with otherFormes/formeOrder.
//
// Example:
//   gardevoirmega: {
//     num: 282,
//     name: "Gardevoir-Mega",
//     isNonstandard: "DigiPen",
//     baseSpecies: "Gardevoir",
//     forme: "Mega",
//     types: ["Psychic", "Fairy"],
//     baseStats: { hp: 68, atk: 85, def: 65, spa: 165, spd: 135, spe: 100 },
//     abilities: { 0: "Pixilate" },
//     heightm: 1.6,
//     weightkg: 48.4,
//     color: "White",
//     eggGroups: ["Amorphous", "Human-Like"],
//     requiredItem: "Gardevoirite",
//   },
//
// ── Overriding Existing Pokémon ─────────────────────────────────────────────
// To change how a base-game Pokémon behaves *only* inside DigiPen formats,
// add its ID with `inherit: true` and override only the fields you want to
// change. The base data is otherwise preserved.
//
// Example:
//   pikachu: {
//     inherit: true,
//     baseStats: { hp: 60, atk: 75, def: 60, spa: 65, spd: 70, spe: 115 },
//   },

export const Pokedex: import('../../../sim/dex-species').ModdedSpeciesDataTable = {
	// ── Fakemon (Original) ─────────────────────────────────────────────
	pootis: {
		num: 2001,
		name: "Pootis",
		isNonstandard: "DigiPen",
		types: ["Fighting"],
		gender: "M",
		baseStats: {hp: 50, atk: 60, def: 50, spa: 60, spd: 50, spe: 35},
		abilities: {0: "Thick Fat", 1: "Gluttony", H: "Ripen"},
		heightm: 0.7,
		weightkg: 34,
		color: "Red",
		evos: ["Armorobin"],
		eggGroups: ["Flying", "Monster"]
	},
	armorobin: {
		num: 2002,
		name: "Armorobin",
		isNonstandard: "DigiPen",
		types: ["Fighting"],
		gender: "M",
		baseStats: {hp: 70, atk: 85, def: 60, spa: 85, spd: 60, spe: 45},
		abilities: {0: "Thick Fat", 1: "Gluttony", H: "Ripen"},
		heightm: 1.5,
		weightkg: 150,
		color: "Red",
		prevo: "Pootis",
		evoLevel: 35,
		eggGroups: ["Flying", "Monster"]
	},
	chickiev: {
		num: 2003,
		name: "Chickiev",
		isNonstandard: "DigiPen",
		types: ["Fighting"],
		gender: "M",
		baseStats: {hp: 85, atk: 105, def: 90, spa: 100, spd: 90, spe: 60},
		abilities: {0: "Thick Fat", 1: "Gluttony", H: "Ripen"},
		heightm: 1.9,
		weightkg: 300,
		color: "Red",
		prevo: "Armorobin",
		evoType: "trade",
		eggGroups: ["Flying", "Monster"]
	},

	// ── Fakemon (from Fanart) ─────────────────────────────────────────────

	// ── Forms/Variants ────────────────────────────────────────────────────

	typhlosiondigipen: {
		num: 157,
		name: "Typhlosion-DigiPen",
		types: ["Fire", "Electric"],
		genderRatio: { M: 0.875, F: 0.125 },
		baseStats: { hp: 78, atk: 90, def: 50, spa: 135, spd: 51, spe: 130 },
		abilities: { 0: "Blaze", H: "Comatose" },
		heightm: 1.8,
		weightkg: 59,
		color: "Yellow",
		prevo: "Quilava",
		evoLevel: 36,
		eggGroups: ["Field"],
	},
	typhlosion: {
		inherit: true,
		otherFormes: ["Typhlosion-Hisui", "Typhlosion-DigiPen"],
		formeOrder: ["Typhlosion", "Typhlosion-Hisui", "Typhlosion-DigiPen"],
	},

	// ── Mega Evolutions ─────────────────────────────────────────────

	// ── Mon Changes/Buffs ────────────────────────────────────────────────────
	abomasnow: {
		inherit: true,
		abilities: {0: "Snow Warning", 1: "Skill Link", H: "Mountaineer"},
		baseStats: {hp: 80, atk: 114, def: 75, spa: 105, spd: 85, spe: 81},
	},
	abomasnowmega: {
		inherit: true,
		baseStats: {hp: 80, atk: 154, def: 105, spa: 145, spd: 105, spe: 51},
	},
};	
