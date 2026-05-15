// DigiPen custom ability definitions.
//
// HOW TO ADD CONTENT:
//
// ── Custom Abilities ─────────────────────────────────────────────────────────
// New DigiPen abilities MUST include `isNonstandard: "DigiPen"` so they are
// treated as illegal outside DigiPen formats.
//
// Example:
//   starrygaze: {
//     num: 1000,
//     name: "Starry Gaze",
//     isNonstandard: "DigiPen",
//     shortDesc: "On switch-in, all adjacent foes lose 1/8 of their max HP.",
//     onStart(pokemon) {
//       for (const foe of pokemon.side.foes()) {
//         if (!foe.fainted) this.damage(foe.baseMaxhp / 8, foe, pokemon);
//       }
//     },
//     rating: 2.5,
//   },
//
// ── Overriding Existing Abilities ────────────────────────────────────────────
// Use `inherit: true` to patch an existing ability without replacing it
// entirely. Only the fields you specify will differ in DigiPen formats.
//
// Example:
//   pixilate: {
//     inherit: true,
//     // In DigiPen formats Pixilate also boosts the converted move's power.
//     onBasePowerPriority: 23,
//     onBasePower(basePower, pokemon, target, move) {
//       if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
//     },
//   },

export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {

	mountaineer: {
		inherit: true,
		isNonstandard: "DigiPen",
	},
	
	// ── DigiPenCustom Abilities ─────────────────────────────────────────────────────────

	// ── Champions "Leaked" Abilities ─────────────────────────────────────────────────────────
	nightmares: {
		onResidualOrder: 28,
		onResidualSubOrder: 2,
		onResidual(pokemon) {
			if (!pokemon.hp) return;
			for (const target of pokemon.foes()) {
				if (target.status === 'slp' || target.hasAbility('comatose')) {
					this.damage(target.baseMaxhp / 4, target, pokemon);
				}
			}
		},
		flags: {},
		name: "Nightmares",
		rating: 2,
		num: 2001,
	},
	thermalboost: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Thermal Boost boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA(atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('Thermal Boost boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Thermal Boost",
		rating: 3.5,
		num: 2002,
	},

	// ── Overriding Existing Abilities ────────────────────────────────────────────
	
};
