// DigiPen tier / formats-data definitions.
//
// Every Pokémon defined in pokedex.ts needs an entry here with:
//   - `isNonstandard: "DigiPen"` — marks it illegal outside DigiPen formats.
//   - `tier`       — singles / NatDex placement
//   - `doublesTier`— doubles placement  (required if used in DigiPen Doubles formats)
//   - `natDexTier` — NatDex placement   (required if used in DigiPen NatDex formats)
//
// Valid DigiPen tier strings (defined in TierTypes.Other in sim/global-types.ts):
//   Singles / NatDex : "DigiPen Uber"  "DigiPen"  "DigiPen NFE"  "DigiPen LC"
//   Doubles          : "DigiPen DUber" "DigiPen"  "DigiPen NFE"  "DigiPen LC"
//
// Overriding a base-game Pokémon's tier inside DigiPen formats:
//   Use `inherit: true` + only the fields you want to differ.
//   The base tier is preserved in all non-DigiPen formats.
//
// Example – a custom Pokémon:
//   digipenmon: { isNonstandard: "DigiPen", tier: "DigiPen", doublesTier: "DigiPen", natDexTier: "DigiPen" },
//
// Example – override an existing Pokémon's tier inside DigiPen only:
//   garchomp: { inherit: true, tier: "DigiPen Uber" },

export const FormatsData: import('../../../sim/dex-species').ModdedSpeciesFormatsDataTable = {
	pootis: {
		isNonstandard: "DigiPen",
		tier: "DigiPen LC",
		doublesTier: "DigiPen LC",
		natDexTier: "DigiPen LC",
	},
	armorobin: {
		isNonstandard: "DigiPen",
		tier: "DigiPen NFE",
		doublesTier: "DigiPen NFE",
		natDexTier: "DigiPen NFE",
	},
	chickiev: {
		isNonstandard: "DigiPen",
		tier: "DigiPen",
		doublesTier: "DigiPen",
		natDexTier: "DigiPen",
	},

	// ── DigiPen-specific tier overrides for base-game Pokémon ───────────────

	abomasnow: {
		inherit: true,
		tier: "DigiPen",
		doublesTier: "DigiPen",
		natDexTier: "DigiPen",
	},
	abomasnowmega: {
		inherit: true,
		tier: "Illegal",
		doublesTier: "Illegal",
		natDexTier: "DigiPen",
	},
};
