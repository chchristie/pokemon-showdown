// DigiPen custom item definitions.
//
// HOW TO ADD CONTENT:
//
// ── Custom Items ─────────────────────────────────────────────────────────────
// New DigiPen items MUST include `isNonstandard: "DigiPen"` so they are
// treated as illegal outside DigiPen formats.
//
// ── Mega Stones ──────────────────────────────────────────────────────────────
// If you define a custom Mega Evolution in pokedex.ts you also need to define
// its Mega Stone here so the validator can find it. Set
// `megaStone: "<Species>-Mega"` and `megaEvolves: "<Species>"`.
//
// ── Overriding Existing Items ─────────────────────────────────────────────────
// Use `inherit: true` to change one or more fields of an existing item without
// replacing the whole entry.
//
// Example Mega Stone (corresponds to the Gardevoir-Mega example in pokedex.ts):
/*
gardevoirite: {
    name: "Gardevoirite",
    isNonstandard: "DigiPen",
    megaStone: "Gardevoir-Mega",
    megaEvolves: "Gardevoir",
    itemUser: ["Gardevoir"],
    shortDesc: "If held by a Gardevoir, this item allows it to Mega Evolve in battle.",
    num: 1000,
    gen: 6,
    isNonstandard: "DigiPen",
},
*/

export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {

	// ── Example: Custom Item ────────────────────────────────────────────────
	/*
	starprism: {
		num: 2000,
		name: "Star Prism",
		isNonstandard: "DigiPen",
		shortDesc: "Holder's Star Blazing has 1.5x power. Consumed after use.",
		onBasePower(basePower, user, target, move) {
			if (move.id === 'starblazing') {
				this.debug('Star Prism boost');
				return this.chainModify(1.5);
			}
		},
		onAfterMove(source, target, move) {
			if (move.id === 'starblazing') this.add('-enditem', source, 'Star Prism', '[eat]');
			source.ateBerry = true;
		},
	},
	*/
};
