// Note: This is the list of formats
// The rules that formats use are stored in data/rulesets.ts

import { CustomMods, type CustomModInfo } from '../data/custom-mods';

/** The formats every custom content mod gets. */
function customModFormats(mod: CustomModInfo): import('../sim/dex-formats').FormatList {
	const label = mod.label;
	// The National Dex mechanics every format here shares.
	const mechanics = ['+Future', '+Light of Ruin'];
	const withMod = [`+${label}`, ...mechanics];
	// A mod-only pool. `All Pokemon` has to be banned inside the ruleset rather than via `banlist`,
	// because every `+` rule must resolve after it and the whole ruleset resolves before the banlist.
	const modOnly = ['-All Pokemon', ...withMod];
	const vgcBase = ['Flat Rules', 'NatDex Mod', '!! Adjust Level = 50', 'VGC Timer', 'Open Team Sheets'];
	const natDex = ['Standard NatDex', ...withMod];
	const vgc = [...vgcBase, ...withMod];
	const doubles = { mod: mod.id, searchShow: false, gameType: 'doubles' as const, bestOfDefault: true };

	const randomSingles: import('../sim/dex-formats').FormatList = !mod.randomBattles ? [] : [{
		name: `[Gen 9 ${label}] Random Battle`,
		desc: `Randomized teams of ${mod.fullName} Pok&eacute;mon with sets that are generated to be competitively viable.`,
		mod: mod.id,
		team: 'random',
		searchShow: false,
		bestOfDefault: true,
		ruleset: [`[Gen 9 ${label}] Singles`, '!Team Preview', 'Illusion Level Mod'],
	}];
	const randomDoubles: import('../sim/dex-formats').FormatList = !mod.randomBattles ? [] : [{
		name: `[Gen 9 ${label}] Random Doubles Battle`,
		desc: `Randomized teams of ${mod.fullName} Pok&eacute;mon for doubles: bring six, pick four.`,
		...doubles,
		team: 'random',
		ruleset: [
			`[Gen 9 ${label}] VGC`, '!Open Team Sheets', '!Adjust Level', '!Adjust Level Down', '!Item Clause',
			'Illusion Level Mod',
		],
	}];

	return [
		{
			section: `${mod.fullName} Singles`,
			column: 1,
		},
		...randomSingles,
		{
			// Only the mod's own Pokémon, and all of them.
			name: `[Gen 9 ${label}] Singles`,
			mod: mod.id,
			searchShow: false,
			ruleset: ['Standard AG', 'NatDex Mod', 'Species Clause', 'Nickname Clause', ...modOnly],
		},
		{
			// Arceus is tagged Mythical rather than Restricted Legendary, so it needs banning by
			// name. `Arceus` resolves to `basepokemon:arceus`, which covers all eighteen formes.
			// The client mirrors this list in `BattleCustomMods.nationalDexBanned`.
			name: `[Gen 9 ${label}] National Dex`,
			mod: mod.id,
			searchShow: false,
			ruleset: natDex,
			banlist: ['Restricted Legendary', 'Arceus'],
		},
		{
			name: `[Gen 9 ${label}] National Dex Ubers`,
			mod: mod.id,
			searchShow: false,
			ruleset: natDex,
		},
		{
			section: `${mod.fullName} Doubles`,
			column: 1,
		},
		...randomDoubles,
		{
			// Only the mod's own Pokémon, and all of them.
			name: `[Gen 9 ${label}] VGC`,
			...doubles,
			ruleset: [...vgcBase, ...modOnly],
		},
		{
			name: `[Gen 9 ${label}] VGC Non-Restricted`,
			...doubles,
			ruleset: vgc,
		},
		{
			name: `[Gen 9 ${label}] VGC Restricted`,
			...doubles,
			ruleset: [...vgc, 'Limit One Restricted'],
			restricted: ['Restricted Legendary'],
		},
		{
			name: `[Gen 9 ${label}] VGC Dual Restricted`,
			...doubles,
			ruleset: [...vgc, 'Limit Two Restricted'],
			restricted: ['Restricted Legendary'],
		},
		{
			name: `[Gen 9 ${label}] VGC Mythical`,
			...doubles,
			ruleset: [...vgc, 'Limit Two Restricted'],
			restricted: ['Restricted Legendary', 'Mythical'],
		},
	];
}

export const Formats: import('../sim/dex-formats').FormatList =
	CustomMods.flatMap(customModFormats);
