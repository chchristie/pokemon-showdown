// DigiPen tier / formats-data definitions.
//
// Every Pokémon defined in pokedex.ts needs an entry here with:
//   - `isNonstandard: "DigiPen"` — marks it illegal outside DigiPen formats.
//   - `tier` — its default DigiPen tier (see TierTypes.DigiPen in global-types.ts).
//
// Valid DigiPen tiers (mirrors standard tiers; prefix "DigiPen " for clarity):
//   "DigiPen Ubers", "DigiPen OU", "DigiPen UU", "DigiPen RU", "DigiPen NU",
//   "DigiPen PU", "DigiPen LC", "DigiPen NFE", "DigiPen Illegal"
//
// Overriding a base-game Pokémon's tier inside DigiPen:
//   Use `inherit: true` + only the fields you want to differ.
//   The base tier is preserved in all non-DigiPen formats.
//
// Example – a custom Pokémon:
//   digipenmon: { isNonstandard: "DigiPen", tier: "DigiPen OU" },
//
// Example – override an existing Pokémon's tier inside DigiPen only:
//   garchomp: { inherit: true, tier: "DigiPen Ubers" },

export const FormatsData: import('../../../sim/dex-species').ModdedSpeciesFormatsDataTable = {

	// ── Custom Pokémon tiers ─────────────────────────────────────────────────
	// Add one entry per Pokémon defined in pokedex.ts. Example:
	/*
	digipenmon: {
		isNonstandard: "DigiPen",
		tier: "DigiPen OU",
	},
	*/

	// ── DigiPen-specific tier overrides for base-game Pokémon ───────────────
	// These only take effect in the gen9digipen mod context. Example:
	/*
	garchomp: {
		inherit: true,
		tier: "DigiPen Ubers",
	},
	*/
};
