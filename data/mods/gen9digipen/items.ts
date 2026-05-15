// DigiPen custom item definitions.
//
// HOW TO ADD CONTENT:
//
// ── Custom Items ─────────────────────────────────────────────────────────────
// New DigiPen items MUST include `isNonstandard: "DigiPen"` so they are
// treated as illegal outside DigiPen formats.
//
// Example:
//   starprism: {
//     num: 2000,
//     name: "Star Prism",
//     isNonstandard: "DigiPen",
//     shortDesc: "Holder's Star Blazing has 1.5x power. Consumed after use.",
//     onBasePower(basePower, user, target, move) {
//       if (move.id === 'starblazing') {
//         this.debug('Star Prism boost');
//         return this.chainModify(1.5);
//       }
//     },
//     onAfterMove(source, target, move) {
//       if (move.id === 'starblazing') this.add('-enditem', source, 'Star Prism', '[eat]');
//       source.ateBerry = true;
//     },
//   },
//
// ── Mega Stones ──────────────────────────────────────────────────────────────
// If you define a custom Mega Evolution in pokedex.ts you also need to define
// its Mega Stone here so the validator can find it. Set
// `megaStone: "<Species>-Mega"` and `megaEvolves: "<Species>"`.
//
// Example (corresponds to the Gardevoir-Mega example in pokedex.ts):
//   gardevoirite: {
//     num: 1000,
//     name: "Gardevoirite",
//     isNonstandard: "DigiPen",
//     megaStone: "Gardevoir-Mega",
//     megaEvolves: "Gardevoir",
//     itemUser: ["Gardevoir"],
//     shortDesc: "If held by a Gardevoir, this item allows it to Mega Evolve in battle.",
//     gen: 6,
//   },
//
// ── Overriding Existing Items ─────────────────────────────────────────────────
// Use `inherit: true` to change one or more fields of an existing item without
// replacing the whole entry.
//
// Example:
//   choiceband: {
//     inherit: true,
//     shortDesc: "Raises Attack by 1.5x but locks the holder into one move.",
//   },

export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {

	// ── Custom Items ─────────────────────────────────────────────────────────

	// -- Buff Items ──────────────────────────────────────────────────────────

	// ── Mega Stones ──────────────────────────────────────────────────────────
	hydreigite: {
		name: "Hydreigite",
		spritenum: 585,
		megaStone: { "Hydreigon": "Hydreigon-Mega" },
		itemUser: ["Hydreigon"],
		onTakeItem(item, source) {
			return !item.megaStone?.[source.baseSpecies.baseSpecies];
		},
		num: 20001,
		gen: 9,
		isNonstandard: "DigiPen",
	},

	// ── Changing Existing Items ─────────────────────────────────────────────

};
