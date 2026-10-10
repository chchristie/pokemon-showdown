// Registry of the custom content ("fakemon") mods.

export interface CustomModInfo {
	/** Mod id, i.e. the folder name under `data/mods/`. */
	id: string;
	/**
	 * Short label. This is the `isNonstandard` value its exclusive content carries, the stem of its
	 * tier names (`DigiPen`, `DigiPen NFE`, `DigiPen LC`), the name inside a format's brackets
	 * (`[Gen 9 FNAF] Singles`) and the word used in teambuilder and dex headers.
	 */
	label: string;
	/**
	 * Full name, used only for the format dropdown's section labels, where there is room for it.
	 * Equal to `label` when the mod has no longer name.
	 */
	fullName: string;
	/** Format-id and tag prefix. Always `toID(label)`. */
	prefix: string;
	/** Whether the mod has random battle formats. Needs `data/random-battles/<id>/`. */
	randomBattles?: boolean;
}

export const CustomMods: CustomModInfo[] = [
	{ id: 'gen9digipen', label: 'DigiPen', fullName: 'DigiPen', prefix: 'digipen' },
	{ id: 'gen9fnaf', label: 'FNAF', fullName: "Five Nights at Freddy's", prefix: 'fnaf', randomBattles: true },
];

/** The mod whose exclusive content is marked with this `isNonstandard` value, if any. */
export function getCustomModByLabel(label: string | undefined | null): CustomModInfo | undefined {
	if (!label) return undefined;
	return CustomMods.find(mod => mod.label === label);
}

/** The mod a species/move/item/ability belongs to exclusively, if any. */
export function getCustomMod(thing: { isNonstandard?: string | null }): CustomModInfo | undefined {
	return getCustomModByLabel(thing.isNonstandard);
}

/**
 * A mod's three tier names, in teambuilder order: fully evolved, not fully evolved, little cup.
 * A mod-exclusive species is assigned one of these from its evolution line; see `dex-species.ts`.
 */
export function getCustomModTiers(label: string) {
	return { fe: label, nfe: `${label} NFE`, lc: `${label} LC` };
}
