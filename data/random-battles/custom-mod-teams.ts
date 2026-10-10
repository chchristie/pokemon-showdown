// Random battle team generator shared by the custom content mods.

import { RandomTeams, type MoveCounter } from './gen9/teams';

/** A set in a mod's `sets.json`. */
export interface CustomModSetData extends RandomTeamsTypes.RandomSetData {
	items?: string[];
}

/** What an item rule can look at. */
export interface ItemRuleContext {
	ability: string;
	types: Set<string>;
	moves: Set<string>;
	counter: MoveCounter;
	teamDetails: RandomTeamsTypes.TeamDetails;
	species: Species;
	isLead: boolean;
	teraType: string;
	role: RandomTeamsTypes.Role;
	isDoubles: boolean;
}
export type ItemRule = (context: ItemRuleContext) => boolean;

export const PIVOT_MOVES = [
	'chillyreception', 'flipturn', 'partingshot', 'shedtail', 'teleport', 'uturn', 'voltswitch',
];
const HAZARDS = ['spikes', 'stealthrock', 'stickyweb', 'toxicspikes'];

export class RandomCustomModTeams extends RandomTeams {
	/** The mod's rule for each of its items, by item name. */
	itemRules: { [itemName: string]: ItemRule } = {};

	/** The mod's own setup moves, by move id, with any extra setup counters each belongs to. */
	modSetupMoves: { [moveid: string]: string[] } = {};

	/** The mod's own moves that switch the user out. */
	modPivotMoves: string[] = [];

	/** The number of damaging moves of a type in a moveset. */
	countDamagingMoves(moves: Set<string>, type: string): number {
		let count = 0;
		for (const moveid of moves) {
			const move = this.dex.moves.get(moveid);
			if (move.category !== 'Status' && move.type === type) count++;
		}
		return count;
	}

	/** Records what a finished set gives the team. */
	trackSet(set: RandomTeamsTypes.RandomSet, teamDetails: RandomTeamsTypes.TeamDetails): void {}

	/** Whether a finished set should be kept out of the last team slot. */
	avoidLastSlot(set: RandomTeamsTypes.RandomSet): boolean {
		return false;
	}

	override queryMoves(
		moves: Set<string> | null,
		species: Species,
		teraType: string,
		abilities: string[],
	): MoveCounter {
		const counter = super.queryMoves(moves, species, teraType, abilities);
		if (!moves) return counter;
		for (const moveid of moves) {
			const extraCounters = this.modSetupMoves[moveid];
			if (!extraCounters) continue;
			counter.add('setup');
			for (const extraCounter of extraCounters) counter.add(extraCounter);
		}
		return counter;
	}

	override cullMovePool(
		types: Set<string>,
		moves: Set<string>,
		abilities: string[],
		counter: MoveCounter,
		movePool: string[],
		teamDetails: RandomTeamsTypes.TeamDetails,
		species: Species,
		isLead: boolean,
		teraType: string,
		role: RandomTeamsTypes.Role,
		isDoubles: boolean,
	): void {
		super.cullMovePool(types, moves, abilities, counter, movePool, teamDetails, species, isLead, teraType, role, isDoubles);
		const modSetup = Object.keys(this.modSetupMoves);
		if (modSetup.length) {
			this.incompatibleMoves(moves, movePool, modSetup, [...PIVOT_MOVES, ...this.modPivotMoves]);
			this.incompatibleMoves(moves, movePool, modSetup, HAZARDS);
		}
		if (this.modPivotMoves.length) {
			const isSetup = (moveid: string) => this.queryMoves(new Set([moveid]), species, teraType, abilities).get('setup') > 0;
			const setup = [...moves, ...movePool].filter(isSetup);
			this.incompatibleMoves(moves, movePool, setup, this.modPivotMoves);
			this.incompatibleMoves(moves, movePool, 'substitute', this.modPivotMoves);
		}
	}

	/** The first of the rolled set's candidate items whose rule passes, if any. */
	getModItem(context: ItemRuleContext): string | undefined {
		const speciesData = (context.isDoubles ? this.randomDoublesSets : this.randomSets)[context.species.id];
		if (!speciesData) return undefined;
		for (const set of speciesData.sets as CustomModSetData[]) {
			if (!set.items || set.role !== context.role) continue;
			const movePool = set.movepool.map(move => this.dex.moves.get(move).id as string);
			if (![...context.moves].every(moveid => moveid === 'terablast' || movePool.includes(moveid))) continue;
			for (const itemName of set.items) {
				const rule = this.itemRules[itemName];
				if (!rule || rule(context)) return this.dex.items.get(itemName).name;
			}
		}
		return undefined;
	}

	override getPriorityItem(
		ability: string,
		types: Set<string>,
		moves: Set<string>,
		counter: MoveCounter,
		teamDetails: RandomTeamsTypes.TeamDetails,
		species: Species,
		isLead: boolean,
		teraType: string,
		role: RandomTeamsTypes.Role,
		isDoubles: boolean,
	) {
		if (!species.requiredItems) {
			const item = this.getModItem({
				ability, types, moves, counter, teamDetails, species, isLead, teraType, role, isDoubles,
			});
			if (item) return item;
		}
		return super.getPriorityItem(ability, types, moves, counter, teamDetails, species, isLead, teraType, role, isDoubles);
	}

	override getLevel(species: Species, isDoubles = false): number {
		if (this.adjustLevel) return this.adjustLevel;
		const level = (isDoubles ? this.randomDoublesSets : this.randomSets)[species.id]?.level;
		return level || (isDoubles ? 50 : 80);
	}

	override randomTeam() {
		this.enforceNoDirectCustomBanlistChanges();

		const seed = this.prng.getSeed();
		const ruleTable = this.dex.formats.getRuleTable(this.format);
		const team: RandomTeamsTypes.RandomSet[] = [];

		const isMonotype = !!this.forceMonotype || ruleTable.has('sametypeclause');
		const isDoubles = this.format.gameType !== 'singles';
		const typePool = this.dex.types.names().filter(name => name !== "Stellar");
		const type = this.forceMonotype || this.sample(typePool);

		const baseFormes = new Set<string>();
		const typeCount: { [k: string]: number } = {};
		const typeWeaknesses: { [k: string]: number } = {};
		const typeDoubleWeaknesses: { [k: string]: number } = {};
		const teamDetails: RandomTeamsTypes.TeamDetails = {};
		const limitFactor = Math.round(this.maxTeamSize / 6) || 1;

		const pokemonList = Object.keys(isDoubles ? this.randomDoublesSets : this.randomSets);
		const [pokemonPool, baseSpeciesPool] = this.getPokemonPool(type, team, isMonotype, pokemonList);

		let leadsRemaining = this.format.gameType === 'doubles' ? 2 : 1;
		if (ruleTable.has('pickedteamsize') || ruleTable.has('teampreview')) leadsRemaining = 0;

		/** Upstream's type balance limits. */
		const isBalanced = (species: Species) => {
			if (isMonotype) return true;
			for (const typeName of species.types) {
				if (typeCount[typeName] >= 2 * limitFactor) return false;
			}
			for (const typeName of this.dex.types.names()) {
				const effectiveness = this.dex.getEffectiveness(typeName, species);
				if (effectiveness > 0 && typeWeaknesses[typeName] >= 3 * limitFactor) return false;
				if (effectiveness > 1 && typeDoubleWeaknesses[typeName] >= limitFactor) return false;
			}
			return this.getPokemonCompatibility(species, team, isDoubles);
		};

		/** Adds one forme of a base species. Returns false if it was rejected for balance. */
		const addToTeam = (baseSpecies: string, enforceBalance: boolean) => {
			// Limit to one of each species (Species Clause)
			if (baseFormes.has(baseSpecies)) return true;
			const species = this.dex.species.get(this.sample(pokemonPool[baseSpecies]));
			if (!species.exists) return true;
			if (enforceBalance && !isBalanced(species)) return false;

			const isLead = leadsRemaining > 0;
			const set = this.randomSet(species, teamDetails, isLead, isDoubles);
			if (isLead) {
				team.unshift(set);
				leadsRemaining--;
			} else {
				team.push(set);
			}

			baseFormes.add(species.baseSpecies);
			for (const typeName of species.types) {
				typeCount[typeName] = (typeCount[typeName] || 0) + 1;
			}
			for (const typeName of this.dex.types.names()) {
				const effectiveness = this.dex.getEffectiveness(typeName, species);
				if (effectiveness > 0) typeWeaknesses[typeName] = (typeWeaknesses[typeName] || 0) + 1;
				if (effectiveness > 1) typeDoubleWeaknesses[typeName] = (typeDoubleWeaknesses[typeName] || 0) + 1;
			}

			// Track what the team has
			if (set.ability === 'Drizzle' || set.moves.includes('raindance')) teamDetails.rain = 1;
			if (set.ability === 'Drought' || set.moves.includes('sunnyday')) teamDetails.sun = 1;
			if (set.ability === 'Sand Stream') teamDetails.sand = 1;
			if (set.ability === 'Snow Warning' || set.moves.includes('snowscape')) teamDetails.snow = 1;
			if (set.moves.includes('healbell')) teamDetails.statusCure = 1;
			if (set.moves.includes('spikes')) teamDetails.spikes = (teamDetails.spikes || 0) + 1;
			if (set.moves.includes('toxicspikes')) teamDetails.toxicSpikes = 1;
			if (set.moves.includes('stealthrock')) teamDetails.stealthRock = 1;
			if (set.moves.includes('stickyweb')) teamDetails.stickyWeb = 1;
			if (set.moves.includes('defog')) teamDetails.defog = 1;
			if (set.moves.includes('rapidspin')) teamDetails.rapidSpin = 1;
			if (set.moves.includes('auroraveil') || (set.moves.includes('reflect') && set.moves.includes('lightscreen'))) {
				teamDetails.screens = 1;
			}
			if (set.role === 'Tera Blast user') teamDetails.teraBlast = 1;
			this.trackSet(set, teamDetails);
			return true;
		};

		const setAside: string[] = [];
		while (baseSpeciesPool.length && team.length < this.maxTeamSize) {
			const baseSpecies = this.sampleNoReplace(baseSpeciesPool);
			if (!addToTeam(baseSpecies, true)) setAside.push(baseSpecies);
		}
		// Fill any remaining slots without the balance limits.
		for (const baseSpecies of setAside) {
			if (team.length >= this.maxTeamSize) break;
			addToTeam(baseSpecies, false);
		}
		if (team.length < this.maxTeamSize && team.length < 12) {
			throw new Error(`Could not build a random team for ${this.format} (seed=${seed})`);
		}

		const last = team.length - 1;
		if (last > 0 && this.avoidLastSlot(team[last])) {
			const swapWith = team.findIndex((set, i) => i > 0 && i < last && !this.avoidLastSlot(set));
			if (swapWith >= 0) [team[swapWith], team[last]] = [team[last], team[swapWith]];
		}

		return team;
	}
}

export default RandomCustomModTeams;
