// Note: `inherit: true` does a shallow merge, so the `learnset` sub-object below
// replaces the parent's learnset for each species. Full movesets are preserved via
// inheritance only when learnset validation is not strictly enforced (e.g. formats
// with officialRater: false). For strict validation, expand these to full learnsets.
export const Learnsets: import('../../../sim/dex-species').ModdedLearnsetDataTable = {

	// ── Base-game Pokémon ─────────────────────────────────────────────
	// Remember to add inherit: true to the base-game Pokémon learnsets.
	beheeyem: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M, 6M"],
		},
	},
	deoxys: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M, 6M"],
		},
	},
	elgyem: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M, 6M"],
		},
	},
	gallade: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M, 6M"],
			swordofdamocles: ["9M"],
		},
	},
	gardevoir: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M, 6M"],
		},
	},
	golduck: {
		inherit: true,
		learnset: {
			inverseroom: ["9M", "8M", "7M", "6M"],
		},
	},
	ironvaliant: {
		inherit: true,
		learnset: {
			starblazing: ["9M"],
		},
	},
	jirachi: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M, 6M"],
		},
	},
	lunala: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M"],
		},
	},
	lunatone: {
		inherit: true,
		learnset: {
			starblazing: ["8M, 7M, 6M"],
		},
	},
	malamar: {
		inherit: true,
		learnset: {
			inverseroom: ["9M", "8M", "7M", "6M"],
		},
	},
	mew: {
		inherit: true,
		learnset: {
			inverseroom: ["9M", "8M", "7M", "6M"],
			starblazing: ["9M, 8M, 7M, 6M"],
		},
	},
	minior: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M, 6M"],
		},
	},
	necrozma: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M"],
		},
	},
	pecharunt: {
		inherit: true,
		learnset: {
			inverseroom: ["9M"],
		},
	},
	sigilyph: {
		inherit: true,
		learnset: {
			inverseroom: ["9M", "8M", "7M", "6M"],
			starblazing: ["9M, 8M, 7M, 6M"],
		},
	},
	solgaleo: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M"],
		},
	},
	solrock: {
		inherit: true,
		learnset: {
			starblazing: ["8M, 7M, 6M"],
		},
	},
	starmie: {
		inherit: true,
		learnset: {
			starblazing: ["8M, 7M, 6M"],
		},
	},
	staryu: {
		inherit: true,
		learnset: {
			starblazing: ["8M, 7M, 6M"],
		},
	},
	victini: {
		inherit: true,
		learnset: {
			starblazing: ["9M, 8M, 7M, 6M"],
		},
	},

	// ── Fakemon (Original) ─────────────────────────────────────────────
	pootis: {
		learnset: {
			recycle: ["9M"],
		},
	},
	armorobin: {
		learnset: {
			recycle: ["9M"],
		},
	},
	chickiev: {
		learnset: {
			recycle: ["9M"],
		},
	},

	// ── Fakemon (from Fanart) ─────────────────────────────────────────────

	// ── Forms/Variants ────────────────────────────────────────────────────

	// ── Mega Evolutions ────────────────────────────────────────────────────

	// ── Mon Changes/Buffs ────────────────────────────────────────────────────
	abomasnow: {
		inherit: true,
		learnset: {
			freezedry: ["9M"],
			iciclecrash: ["9M"],
			rockblast: ["9M"],
		},
	}
};
