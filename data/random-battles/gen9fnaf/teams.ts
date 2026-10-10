import { RandomCustomModTeams, PIVOT_MOVES, type ItemRule } from '../custom-mod-teams';
import { type MoveCounter } from '../gen9/teams';

// Abilities that prevent or shorten sleep.
const SLEEP_PROOF_ABILITIES = [
	'Insomnia', 'Vital Spirit', 'Comatose', 'Sweet Veil', 'Purifying Salt', 'Early Bird', 'Shed Skin',
];
// Abilities that prevent sleep through terrain.
const SLEEP_PROOF_TERRAIN_ABILITIES = ['Electric Surge', 'Misty Surge'];
// Moves boosted by Missing Beak.
const BEAK_MOVES = ['peck', 'drillpeck', 'pluck', 'beakblast', 'boltbeak'];
// Offensive roles.
const ILLUSION_DISC_ROLES = [
	'Fast Attacker', 'Wallbreaker', 'Tera Blast user', 'Doubles Fast Attacker', 'Doubles Wallbreaker', 'Offensive Protect',
];

const PROTECT_MOVES = ['banefulbunker', 'burningbulwark', 'protect', 'silktrap', 'spikyshield'];
const DEFENSIVE_TERA_BLAST_USERS = ['alcremie', 'bellossom', 'comfey', 'fezandipiti', 'florges'];

export class RandomFNAFTeams extends RandomCustomModTeams {
	override randomSets: { [species: string]: RandomTeamsTypes.RandomSpeciesData } = require('./sets.json');
	override randomDoublesSets: { [species: string]: RandomTeamsTypes.RandomSpeciesData } = require('./doubles-sets.json');

	// Raise the user's stats along with its ally's.
	override modSetupMoves: { [moveid: string]: string[] } = {
		speedsong: ['speedsetup'],
		powersong: ['mixedsetup'],
		armorsong: [],
	};

	override modPivotMoves = ['mysterybox'];

	override itemRules: { [itemName: string]: ItemRule } = {
		Remnant: ({ moves }) => (
			this.countDamagingMoves(moves, 'Steel') >= 1 && this.countDamagingMoves(moves, 'Ghost') >= 1
		),
		'Music Box': ({ ability, types }) => (
			SLEEP_PROOF_ABILITIES.includes(ability) ||
			(SLEEP_PROOF_TERRAIN_ABILITIES.includes(ability) && !types.has('Flying'))
		),
		'Missing Beak': ({ moves }) => BEAK_MOVES.some(moveid => moves.has(moveid)),
		'Illusion Disc': ({ role, teamDetails }) => ILLUSION_DISC_ROLES.includes(role) && !teamDetails.illusion,
		'Freddy Mask': ({ moves, counter }) => (
			counter.get('setup') > 0 || [...moves].every(moveid => this.dex.moves.get(moveid).category === 'Status')
		),
	};

	override shouldCullAbility(
		ability: string,
		types: Set<string>,
		moves: Set<string>,
		abilities: string[],
		counter: MoveCounter,
		teamDetails: RandomTeamsTypes.TeamDetails,
		species: Species,
		role: RandomTeamsTypes.Role,
		isLead: boolean,
		isDoubles: boolean,
	): boolean {
		if (ability === 'Triage') return ![...moves].some(moveid => this.dex.moves.get(moveid).flags['heal']);
		return super.shouldCullAbility(
			ability, types, moves, abilities, counter, teamDetails, species, role, isLead, isDoubles
		);
	}

	// Add Freddy Mask and Jumpscare to item logic.
	override getDoublesItem(
		ability: string,
		types: Set<string>,
		moves: Set<string>,
		counter: MoveCounter,
		teamDetails: RandomTeamsTypes.TeamDetails,
		species: Species,
		isLead: boolean,
		teraType: string,
		role: RandomTeamsTypes.Role,
	): string {
		const scarfReqs = (
			!counter.get('priority') && ability !== 'Speed Boost' && role !== 'Doubles Wallbreaker' &&
			species.baseStats.spe >= 60 && species.baseStats.spe <= 108 &&
			this.randomChance(1, 2)
		);
		const offensiveRole = (
			['Doubles Fast Attacker', 'Doubles Wallbreaker', 'Doubles Setup Sweeper', 'Offensive Protect'].some(m => role === m)
		);

		if (species.id === 'ursalunabloodmoon' && moves.has('protect')) return 'Silk Scarf';
		if (
			moves.has('flipturn') && moves.has('protect') && (moves.has('aquajet') || (moves.has('jetpunch')))
		) return 'Mystic Water';
		if (counter.get('speedsetup') && role === 'Doubles Bulky Setup') return 'Weakness Policy';
		if (moves.has('blizzard') && ability !== 'Snow Warning' && !teamDetails.snow) return 'Blunder Policy';

		if (role === 'Choice Item user') {
			if (scarfReqs || moves.has('finalgambit') || species.id === 'jirachi') return 'Choice Scarf';
			return (counter.get('Physical') > counter.get('Special')) ? 'Choice Band' : 'Choice Specs';
		}
		if (counter.get('Physical') >= moves.size &&
			['fakeout', 'feint', 'firstimpression', 'jumpscare', 'rapidspin', 'suckerpunch'].every(m => !moves.has(m)) &&
			(moves.has('flipturn') || moves.has('uturn') || role === 'Doubles Wallbreaker')
		) {
			return (scarfReqs) ? 'Choice Scarf' : 'Choice Band';
		}
		if (
			((counter.get('Special') >= moves.size && (moves.has('voltswitch') || role === 'Doubles Wallbreaker')) || (
				counter.get('Special') >= moves.size - 1 && (moves.has('uturn') || moves.has('flipturn'))
			)) && !moves.has('electroweb')
		) {
			return (scarfReqs) ? 'Choice Scarf' : 'Choice Specs';
		}
		if (
			species.baseStats.spe <= 70 && (moves.has('ragepowder') || moves.has('followme'))
		) return 'Rocky Helmet';
		if (
			ability === 'Intimidate' && this.dex.getEffectiveness('Rock', species) >= 1 &&
			(!types.has('Flying') || this.dex.getEffectiveness('Rock', species) >= 2)
		) return 'Heavy-Duty Boots';
		if (
			role === 'Doubles Support' && ability === 'Prankster' && moves.has('tailwind') && this.randomChance(1, 4)
		) return 'Covert Cloak';
		if (counter.get('setup') && this.randomChance(1, 5)) return 'Freddy Mask';
		if (
			(role === 'Bulky Protect' && counter.get('setup')) ||
			['irondefense', 'coil', 'acidarmor', 'wish'].some(m => moves.has(m)) ||
			(counter.get('recovery') && !moves.has('strengthsap') && !counter.get('speedcontrol') && !offensiveRole) ||
			(PROTECT_MOVES.some(m => moves.has(m)) && moves.has('leechseed')) ||
			species.id === 'regigigas'
		) return 'Leftovers';
		if (moves.has('hypervoice') && !types.has('Normal')) return 'Throat Spray';
		if (
			role === 'Doubles Fast Attacker' && !counter.get('recoil') &&
			species.baseStats.hp + species.baseStats.def + species.baseStats.spd <= 230
		) return 'Focus Sash';
		if (
			(offensiveRole || (role === 'Tera Blast user' && (species.baseStats.spe >= 80 || moves.has('trickroom')))) &&
			!moves.has('fakeout') && !moves.has('jumpscare') &&
			(!moves.has('uturn') || types.has('Bug') || ability === 'Libero') &&
			((!moves.has('icywind') && !moves.has('electroweb')) || species.id === 'ironbundle')
		) {
			return (
				(ability === 'Quark Drive' || ability === 'Protosynthesis') && !isLead && species.id !== 'ironvaliant' &&
				['dracometeor', 'firstimpression', 'uturn', 'voltswitch'].every(m => !moves.has(m))
			) ? 'Booster Energy' : 'Life Orb';
		}
		if (isLead && (species.id === 'glimmora' ||
			(['Doubles Wallbreaker', 'Offensive Protect'].includes(role) &&
				species.baseStats.hp + species.baseStats.def + species.baseStats.spd <= 230))
		) return 'Focus Sash';
		if (
			['Doubles Fast Attacker', 'Doubles Wallbreaker', 'Offensive Protect'].includes(role) &&
			(moves.has('fakeout') || moves.has('jumpscare'))
		) {
			return (this.dex.getEffectiveness('Rock', species) >= 1) ? 'Heavy-Duty Boots' : 'Clear Amulet';
		}
		if (!counter.get('Status')) return 'Assault Vest';
		return 'Sitrus Berry';
	}

	override getItem(
		ability: string,
		types: Set<string>,
		moves: Set<string>,
		counter: MoveCounter,
		teamDetails: RandomTeamsTypes.TeamDetails,
		species: Species,
		isLead: boolean,
		teraType: string,
		role: RandomTeamsTypes.Role,
	): string {
		const lifeOrbReqs = ['flamecharge', 'nuzzle', 'rapidspin'].every(m => !moves.has(m));

		if (
			species.id !== 'jirachi' && (counter.get('Physical') >= moves.size) &&
			[
				'dragontail', 'fakeout', 'firstimpression', 'flamecharge', 'jumpscare', 'rapidspin', 'trailblaze',
			].every(m => !moves.has(m))
		) {
			const scarfReqs = (
				role !== 'Wallbreaker' &&
				(species.baseStats.atk >= 100 || ability === 'Huge Power' || ability === 'Pure Power') &&
				species.baseStats.spe >= 60 && species.baseStats.spe <= 108 &&
				ability !== 'Speed Boost' && !counter.get('priority')
			);
			return (scarfReqs && this.randomChance(1, 2)) ? 'Choice Scarf' : 'Choice Band';
		}
		if (
			(counter.get('Special') >= moves.size) ||
			(counter.get('Special') >= moves.size - 1 && ['flipturn', 'uturn'].some(m => moves.has(m)))
		) {
			const scarfReqs = (
				role !== 'Wallbreaker' &&
				species.baseStats.spa >= 100 &&
				species.baseStats.spe >= 60 && species.baseStats.spe <= 108 &&
				ability !== 'Speed Boost' && ability !== 'Tinted Lens' && !moves.has('uturn') && !counter.get('priority')
			);
			return (scarfReqs && this.randomChance(1, 2)) ? 'Choice Scarf' : 'Choice Specs';
		}
		if (counter.get('speedsetup') && !counter.get('physicalsetup') && role === 'Bulky Setup') return 'Weakness Policy';
		if (
			!counter.get('Status') &&
			!['Fast Attacker', 'Wallbreaker', 'Tera Blast user'].includes(role)
		) {
			return 'Assault Vest';
		}
		if (species.id === 'golem') return (counter.get('speedsetup')) ? 'Weakness Policy' : 'Custap Berry';
		if (moves.has('substitute')) return 'Leftovers';
		if (
			moves.has('stickyweb') && isLead &&
			(species.baseStats.hp + species.baseStats.def + species.baseStats.spd) <= 235
		) return 'Focus Sash';
		if (this.dex.getEffectiveness('Rock', species) >= 1) return 'Heavy-Duty Boots';
		if (
			(moves.has('chillyreception') || (
				role === 'Fast Support' &&
				[...PIVOT_MOVES, 'defog', 'mortalspin', 'rapidspin'].some(m => moves.has(m)) &&
				!types.has('Flying') && ability !== 'Levitate'
			))
		) return 'Heavy-Duty Boots';

		// Low Priority
		if (moves.has('dragondance') && role === 'Bulky Setup') return 'Weakness Policy';
		if (
			ability === 'Rough Skin' || (
				ability === 'Regenerator' && (role === 'Bulky Support' || role === 'Bulky Attacker') &&
				(species.baseStats.hp + species.baseStats.def) >= 180 && this.randomChance(1, 2)
			) || (
				ability !== 'Regenerator' && !counter.get('setup') && counter.get('recovery') &&
				this.dex.getEffectiveness('Fighting', species) < 1 &&
				(species.baseStats.hp + species.baseStats.def) > 200 && this.randomChance(1, 2)
			)
		) return 'Rocky Helmet';
		if (moves.has('outrage') && counter.get('setup')) return 'Lum Berry';
		if (moves.has('protect') && ability !== 'Speed Boost') return 'Leftovers';
		if (
			role === 'Fast Support' && isLead && !counter.get('recovery') && !counter.get('recoil') &&
			(counter.get('hazards') || counter.get('setup')) &&
			(species.baseStats.hp + species.baseStats.def + species.baseStats.spd) < 258
		) return 'Focus Sash';
		if (
			!counter.get('setup') && ability !== 'Levitate' && this.dex.getEffectiveness('Ground', species) >= 2
		) return 'Air Balloon';
		if (['Bulky Attacker', 'Bulky Support', 'Bulky Setup'].some(m => role === (m))) return 'Leftovers';
		if (species.id === 'pawmot' && moves.has('nuzzle')) return 'Leppa Berry';
		if (role === 'Fast Support' || role === 'Fast Bulky Setup') {
			return (
				counter.get('Physical') + counter.get('Special') > counter.get('Status') && lifeOrbReqs
			) ? 'Life Orb' : 'Leftovers';
		}
		if (role === 'Tera Blast user' && DEFENSIVE_TERA_BLAST_USERS.includes(species.id)) return 'Leftovers';
		if (
			lifeOrbReqs && ['Fast Attacker', 'Setup Sweeper', 'Tera Blast user', 'Wallbreaker'].some(m => role === (m))
		) return 'Life Orb';
		return 'Leftovers';
	}

	override trackSet(set: RandomTeamsTypes.RandomSet, teamDetails: RandomTeamsTypes.TeamDetails) {
		if (set.item === 'Illusion Disc') teamDetails.illusion = 1;
	}

	override avoidLastSlot(set: RandomTeamsTypes.RandomSet) {
		return set.item === 'Illusion Disc';
	}
}

export default RandomFNAFTeams;
