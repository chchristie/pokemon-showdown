'use strict';

/**
 * DigiPen fork: the standardized custom content mods.
 *
 * These lock in the parts of the design that are easy to break by accident — a format ruleset that
 * lets in content it shouldn't, a tier that stops matching its evolution line, a tag that stops
 * marking a mod's items as existing.
 */

const assert = require('./../assert');
const common = require('./../common');
const { CustomMods, getCustomModTiers } = require('../../dist/data/custom-mods');
const { TeamValidator } = require('../../dist/sim/team-validator');
const { Teams } = require('../../dist/sim/teams');
const fs = require('fs');
const path = require('path');

const PERFECT_IVS = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

/** The formats generated for a mod, by the name they get in `config/custom-formats.ts`. */
function formatsFor(mod) {
	const suffixes = [
		'singles', 'nationaldex', 'nationaldexubers',
		'vgc', 'vgcnonrestricted', 'vgcrestricted', 'vgcdualrestricted', 'vgcmythical',
	];
	return suffixes.map(suffix => `gen9${mod.prefix}${suffix}`);
}

/** A set that is legal apart from whatever the test is probing. */
function makeSet(species, extra) {
	return {
		name: species, species, item: '', ability: '', moves: [],
		evs: { hp: 4 }, ivs: PERFECT_IVS, level: 100, nature: 'Serious',
		...extra,
	};
}

/** Whether a format rejects a species on legality grounds, ignoring moveset complaints. */
function speciesIsBanned(formatid, speciesName) {
	const problems = new TeamValidator(formatid).validateSet(makeSet(speciesName), {}) || [];
	return problems.some(problem => (
		problem.includes('does not exist') ||
		problem.includes('is made up for Smogon CAP') ||
		problem.includes('not in the list of allowed pokemon') ||
		problem.includes('banned')
	));
}

describe('Custom content mods', () => {
	it('should give every mod the same eight formats, and all of them should load', () => {
		for (const mod of CustomMods) {
			for (const formatid of formatsFor(mod)) {
				const format = Dex.formats.get(formatid);
				assert(format.exists, `${mod.label} is missing the format ${formatid}`);
				assert.doesNotThrow(
					() => Dex.formats.getRuleTable(format),
					`${format.name} has an unusable ruleset`
				);
			}
		}
	});

	it('should not allow CAP Pokemon in any mod format', () => {
		const capSpecies = Object.keys(Dex.data.Pokedex)
			.map(id => Dex.species.get(id))
			.filter(species => species.isNonstandard === 'CAP');
		assert(capSpecies.length > 0, 'expected the base dex to contain CAP Pokemon to test against');
		for (const mod of CustomMods) {
			for (const formatid of formatsFor(mod)) {
				for (const species of capSpecies.slice(0, 5)) {
					assert(
						speciesIsBanned(formatid, species.name),
						`${species.name} is a CAP Pokemon but is legal in ${formatid}`
					);
				}
			}
		}
	});

	it('should not allow unobtainable Pokemon in any mod format', () => {
		const unobtainable = Object.keys(Dex.data.Pokedex)
			.map(id => Dex.species.get(id))
			.filter(species => (
				species.isNonstandard === 'Unobtainable' || species.tags?.includes('Past Unobtainable')
			));
		assert(unobtainable.length > 0, 'expected the base dex to contain unobtainable Pokemon');
		for (const mod of CustomMods) {
			for (const formatid of formatsFor(mod)) {
				for (const species of unobtainable) {
					assert(
						speciesIsBanned(formatid, species.name),
						`${species.name} is unobtainable but is legal in ${formatid}`
					);
				}
			}
		}
	});

	it('should keep restricted legendaries and Arceus out of National Dex but not National Dex Ubers', () => {
		// Arceus is tagged Mythical rather than Restricted Legendary, so the banlist names it; that
		// bans every forme. The client mirrors this in `BattleCustomMods.nationalDexBanned`.
		for (const mod of CustomMods) {
			const natDex = `gen9${mod.prefix}nationaldex`;
			const ubers = `gen9${mod.prefix}nationaldexubers`;
			for (const name of ['Koraidon', 'Arceus', 'Arceus-Fire', 'Arceus-Ghost']) {
				assert(speciesIsBanned(natDex, name), `${name} should be banned in ${natDex}`);
				assert(!speciesIsBanned(ubers, name), `${name} should be legal in ${ubers}`);
			}
			// Other Mythicals are unaffected.
			assert(!speciesIsBanned(natDex, 'Mew'), `Mew should be legal in ${natDex}`);
		}
	});

	it("should take a mod species' tier from its evolution line", () => {
		for (const mod of CustomMods) {
			const tiers = getCustomModTiers(mod.label);
			const modDex = Dex.mod(mod.id);
			let seen = 0;
			for (const id in require(`../../dist/data/mods/${mod.id}/pokedex`).Pokedex) {
				const species = modDex.species.get(id);
				if (species.isNonstandard !== mod.label) continue;
				seen++;
				const evolvesTwice = species.evos.some(evo => modDex.species.get(evo).evos.length);
				const expected = !species.evos.length ? tiers.fe : evolvesTwice ? tiers.lc : tiers.nfe;
				assert.equal(species.tier, expected, `${species.name} should be ${expected}`);
				assert.equal(species.natDexTier, expected, `${species.name} natDexTier`);
				assert.equal(species.doublesTier, expected, `${species.name} doublesTier`);
			}
			assert(seen > 0, `${mod.label} has no Pokemon of its own`);
		}
	});

	it("should let a mod's own items be held in its formats", () => {
		// Regression: the `fnaf` tag was a speciesFilter, not a genericFilter, so `+FNAF` could
		// never mark an *item* as existing and every FNAF item was rejected as nonexistent.
		for (const mod of CustomMods) {
			const modDex = Dex.mod(mod.id);
			// A Pokemon of this mod's own that has a movepool, and an item of its own that does not
			// force a forme, so the set is legal apart from the thing being tested.
			const species = Object.keys(require(`../../dist/data/mods/${mod.id}/pokedex`).Pokedex)
				.map(id => modDex.species.get(id))
				.find(s => s.isNonstandard === mod.label && modDex.data.Learnsets[s.id]?.learnset);
			const items = Object.keys(require(`../../dist/data/mods/${mod.id}/items`).Items)
				.map(id => modDex.items.get(id))
				.filter(item => (
					item.isNonstandard === mod.label && !item.forcedForme && !item.itemUser && !item.megaStone
				));
			assert(species, `${mod.label} has no Pokemon of its own with a movepool`);
			if (!items.length) continue;

			const move = Object.keys(modDex.data.Learnsets[species.id].learnset)[0];
			for (const formatid of formatsFor(mod)) {
				for (const item of items) {
					const problems = new TeamValidator(formatid).validateSet(makeSet(species.name, {
						item: item.name, ability: species.abilities[0], moves: [modDex.moves.get(move).name],
					}), {}) || [];
					assert.deepEqual(
						problems, [],
						`${species.name} holding ${item.name} should be legal in ${formatid}`
					);
				}
			}
		}
	});

	it("should add a mod's learnset entries to the inherited movepool, not replace it", () => {
		// Regression: the dex loader merges one level deep, so a mod listing one new move used to
		// leave the Pokemon with only that move.
		for (const mod of CustomMods) {
			const modDex = Dex.mod(mod.id);
			for (const id in require(`../../dist/data/mods/${mod.id}/learnsets`).Learnsets) {
				const baseLearnset = Dex.data.Learnsets[id]?.learnset;
				if (!baseLearnset) continue;
				const modLearnset = modDex.data.Learnsets[id]?.learnset;
				for (const moveid in baseLearnset) {
					assert(
						modLearnset[moveid],
						`${mod.label} dropped ${moveid} from ${id}'s movepool`
					);
				}
			}
		}
	});
});

describe('FNAF Phantom abilities', () => {
	// The test helper's per-mod "Custom Game" format doesn't exist for the fork's mods.
	const FNAF_BATTLE = { formatid: 'gen9fnafsingles@@@!Team Preview' };
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it("Blackout should lower the target's accuracy when the holder damages it", () => {
		battle = common.createBattle(FNAF_BATTLE, [[
			{ species: 'Phantom Balloon Boy', ability: 'blackout', moves: ['airslash', 'tailwind'] },
		], [
			{ species: 'Chansey', ability: 'naturalcure', moves: ['softboiled'] },
		]]);
		battle.makeChoices('move tailwind', 'move softboiled');
		assert.statStage(battle.p2.active[0], 'accuracy', 0, 'a status move should not trigger it');
		battle.makeChoices('move airslash', 'move softboiled');
		assert.statStage(battle.p2.active[0], 'accuracy', -1);
	});

	it("Audio Disturbance should lower the target's evasiveness once per move, even if it hits several times", () => {
		battle = common.createBattle(FNAF_BATTLE, [[
			{ species: 'Phantom Mangle', ability: 'audiodisturbance', moves: ['bugbuzz', 'pinmissile'] },
		], [
			{ species: 'Chansey', ability: 'naturalcure', moves: ['softboiled'] },
		]]);
		battle.makeChoices('move bugbuzz', 'move softboiled');
		assert.statStage(battle.p2.active[0], 'evasion', -1);
		battle.makeChoices('move pinmissile', 'move softboiled');
		assert.statStage(battle.p2.active[0], 'evasion', -2);
	});

	it('Blackout should hit both targets of a spread move, and do nothing through a Substitute', () => {
		battle = common.createBattle({ formatid: 'gen9fnafvgc' }, [[
			{ species: 'Phantom Balloon Boy', ability: 'blackout', moves: ['rainyday', 'airslash'] },
			{ species: 'Chansey', ability: 'naturalcure', moves: ['softboiled'] },
		], [
			{ species: 'Chansey', ability: 'naturalcure', moves: ['softboiled'] },
			{ species: 'Blissey', ability: 'naturalcure', moves: ['substitute', 'softboiled'] },
		]]);
		battle.makeChoices(); // Team Preview
		battle.makeChoices('move rainyday, move softboiled', 'move softboiled, move substitute');
		assert.statStage(battle.p2.active[0], 'accuracy', -1);
		assert.statStage(battle.p2.active[1], 'accuracy', -1);
		battle.makeChoices('move airslash 2, move softboiled', 'move softboiled, move softboiled');
		assert.statStage(battle.p2.active[1], 'accuracy', -1, 'a hit on the Substitute should not lower it again');
	});

	it('Audio Disturbance should be stopped by Clear Body', () => {
		battle = common.createBattle(FNAF_BATTLE, [[
			{ species: 'Phantom Mangle', ability: 'audiodisturbance', moves: ['bugbuzz'] },
		], [
			{ species: 'Metagross', ability: 'clearbody', moves: ['irondefense'] },
		]]);
		battle.makeChoices('move bugbuzz', 'move irondefense');
		assert.statStage(battle.p2.active[0], 'evasion', 0);
	});

	it('should keep every Phantom below 60 Attack', () => {
		const dex = Dex.mod('gen9fnaf');
		for (const species of dex.species.all()) {
			if (!species.name.startsWith('Phantom ')) continue;
			assert(species.baseStats.atk < 60, `${species.name} has ${species.baseStats.atk} Attack`);
		}
	});
});

describe('Custom mod random battles', () => {
	const randomMods = CustomMods.filter(mod => mod.randomBattles);
	const FILES = { randombattle: 'sets.json', randomdoublesbattle: 'doubles-sets.json' };
	const ONE_HIT_KO = move => !!move.ohko;

	/** Every [format, mod, sets] triple that should exist. */
	function randomFormats() {
		const formats = [];
		for (const mod of randomMods) {
			for (const [suffix, file] of Object.entries(FILES)) {
				const sets = require(`../../dist/data/random-battles/${mod.id}/${file}`);
				formats.push({ mod, sets, format: Dex.formats.get(`gen9${mod.prefix}${suffix}`) });
			}
		}
		return formats;
	}

	it('should have at least one mod with random battles', () => {
		assert(randomMods.length > 0);
	});

	it('should give those mods a singles format without Team Preview and a doubles format that picks four, both with closed sheets and no flat level', () => {
		for (const { format } of randomFormats()) {
			assert(format.exists, `missing format ${format.id}`);
			assert.equal(format.team, 'random');
			const ruleTable = Dex.formats.getRuleTable(format);
			const isDoubles = format.gameType === 'doubles';
			assert.equal(ruleTable.has('teampreview'), isDoubles, `${format.name}: Team Preview`);
			assert.equal(ruleTable.pickedTeamSize, isDoubles ? 4 : null, `${format.name}: picked team size`);
			assert(!ruleTable.has('openteamsheets'), `${format.name} has Open Team Sheets`);
			assert(!ruleTable.adjustLevel && !ruleTable.adjustLevelDown, `${format.name} flattens levels`);
			assert(!ruleTable.valueRules.get('itemclause'), `${format.name} lists an Item Clause it can't enforce`);
			assert(ruleTable.has('illusionlevelmod'), `${format.name} is missing Illusion Level Mod`);
		}
	});

	it('should only list sets the Pokemon can actually run', () => {
		for (const { mod, sets, format } of randomFormats()) {
			const dex = Dex.mod(mod.id);
			for (const id in sets) {
				const species = dex.species.get(id);
				const where = `${format.name}: ${id}`;
				assert(species.exists && species.id === id, `${where} is not a species id`);
				assert.equal(species.isNonstandard, mod.label, `${where} is not one of ${mod.label}'s own Pokemon`);
				assert(sets[id].sets.length > 0, `${where} has no sets`);
				const learnset = dex.species.getLearnsetData(species.id).learnset ||
					dex.species.getLearnsetData(dex.species.get(species.changesFrom || species.baseSpecies).id).learnset;
				const abilities = Object.values(species.abilities).map(name => dex.abilities.get(name).id);
				for (const set of sets[id].sets) {
					assert(set.role && set.movepool.length >= 4, `${where} (${set.role}) needs a role and four moves`);
					for (const moveName of set.movepool) {
						const move = dex.moves.get(moveName);
						assert(move.exists && move.name === moveName, `${where}: "${moveName}" is not a move name`);
						assert(learnset[move.id], `${where} can't learn ${moveName}`);
						assert(!ONE_HIT_KO(move), `${where}: one-hit KO moves are left out of random battles (${moveName})`);
					}
					assert(set.abilities.length > 0, `${where} (${set.role}) lists no abilities`);
					for (const abilityName of set.abilities) {
						const ability = dex.abilities.get(abilityName);
						assert(ability.exists && ability.name === abilityName, `${where}: "${abilityName}" is not an ability name`);
						assert(abilities.includes(ability.id), `${where} doesn't have ${abilityName}`);
					}
					assert(set.teraTypes.length > 0, `${where} (${set.role}) lists no Tera types`);
					for (const type of set.teraTypes) {
						assert(dex.types.get(type).exists, `${where}: "${type}" is not a type`);
					}
					for (const itemName of set.items || []) {
						const item = dex.items.get(itemName);
						assert(item.exists && item.name === itemName, `${where}: "${itemName}" is not an item name`);
					}
				}
			}
		}
	});

	it('should always build a full team', function () {
		this.timeout(0);
		for (const { format } of randomFormats()) {
			for (let i = 0; i < 500; i++) {
				const team = Teams.generate(format, { seed: [i, 2, 3, 4] });
				assert.equal(team.length, 6, `${format.name}, seed ${i}`);
				assert.equal(new Set(team.map(set => set.name)).size, 6, `${format.name}, seed ${i}: Species Clause`);
			}
		}
	});

	it('should support Adjust Level', () => {
		for (const { format } of randomFormats()) {
			const team = Teams.generate(`${format.id}@@@Adjust Level = 37`, { seed: [1, 2, 3, 4] });
			for (const set of team) assert.equal(set.level, 37);
		}
	});

	it('should keep a mod pivot move off sets that rolled a setup move', () => {
		const generator = Teams.getGenerator('gen9fnafrandombattle', [1, 2, 3, 4]);
		const species = Dex.mod('gen9fnaf').species.get('thepuppet');
		const movePool = ['mysterybox', 'shadowball', 'dazzlinggleam', 'taunt', 'painsplit'];
		const moves = new Set(['calmmind']);
		const counter = generator.queryMoves(moves, species, 'Ghost', ['Levitate']);
		generator.cullMovePool(
			new Set(species.types), moves, ['Levitate'], counter, movePool, {}, species, false, 'Ghost', 'Setup Sweeper', false
		);
		assert(!movePool.includes('mysterybox'));
	});

	it("should use each of FNAF's own moves and abilities in both formats, apart from the listed exceptions", () => {
		const dex = Dex.mod('gen9fnaf');
		// Why each one is an exception is in docs/fakemon/fnaf/random-battle-sets.md.
		const EXCEPTIONS = {
			singles: ['Birthday', 'Happy Jam', 'Distracting Voice', 'Regen Song', 'Follow Me'],
			doubles: ['Hot Cheese', 'Mystery Box', 'Water Hose'],
			both: ['Esc Key', 'Unscrew', 'Balloons', 'Munchies', 'Poppers', 'Mimic Ball', 'Fourth Wall', 'Bubble Breath'],
		};
		const species = dex.species.all().filter(s => s.isNonstandard === 'FNAF');
		const learnable = move => species.some(s => dex.species.getLearnsetData(s.id).learnset?.[move.id]);
		const held = ability => species.some(s => Object.values(s.abilities).some(name => dex.abilities.get(name).id === ability.id));
		const own = [
			...dex.moves.all().filter(move => move.isNonstandard === 'FNAF' && learnable(move)),
			...dex.abilities.all().filter(ability => ability.isNonstandard === 'FNAF' && held(ability)),
		];
		for (const { mod, sets, format } of randomFormats()) {
			if (mod.id !== 'gen9fnaf') continue;
			const which = format.gameType === 'doubles' ? 'doubles' : 'singles';
			const used = new Set();
			for (const id in sets) {
				for (const set of sets[id].sets) {
					for (const name of [...set.movepool, ...set.abilities]) used.add(name);
				}
			}
			for (const thing of own) {
				const excepted = EXCEPTIONS[which].includes(thing.name) || EXCEPTIONS.both.includes(thing.name);
				assert.equal(
					used.has(thing.name), !excepted,
					`${thing.name} in ${format.name}: ${excepted ? 'listed as an exception but is used' : 'not in any set'}`
				);
			}
		}
	});

	it('should let any FNAF set with a setup move roll Freddy Mask in doubles, and none in singles', function () {
		this.timeout(0);
		const unlisted = { singles: 0, doubles: 0 };
		for (const { mod, sets, format } of randomFormats()) {
			if (mod.id !== 'gen9fnaf') continue;
			const which = format.gameType === 'doubles' ? 'doubles' : 'singles';
			const generator = Teams.getGenerator(format, [1, 2, 3, 4]);
			for (const id in sets) {
				if (sets[id].sets.some(set => set.items?.includes('Freddy Mask'))) continue;
				for (let i = 0; i < 60; i++) {
					const set = generator.randomSet(id, {}, false, which === 'doubles');
					if (set.item !== 'Freddy Mask') continue;
					unlisted[which]++;
					const species = Dex.mod('gen9fnaf').species.get(id);
					const counter = generator.queryMoves(new Set(set.moves), species, set.teraType, [set.ability]);
					assert(counter.get('setup') > 0, `${species.name} rolled Freddy Mask with ${set.moves.join(', ')}`);
				}
			}
		}
		assert.equal(unlisted.singles, 0);
		assert(unlisted.doubles > 0, 'expected some doubles setup sets to roll Freddy Mask');
	});

	it('should hand out Choice items about as often as upstream does', function () {
		this.timeout(0);
		const choiceShare = formatid => {
			let choice = 0;
			let total = 0;
			for (let i = 0; i < 300; i++) {
				for (const set of Teams.generate(formatid, { seed: [i, 3, 5, 7] })) {
					total++;
					if (set.item.startsWith('Choice ')) choice++;
				}
			}
			return 100 * choice / total;
		};
		for (const { format } of randomFormats()) {
			const upstream = format.gameType === 'doubles' ? 'gen9randomdoublesbattle' : 'gen9randombattle';
			const ours = choiceShare(format.id);
			const theirs = choiceShare(upstream);
			assert(
				Math.abs(ours - theirs) <= 5,
				`${format.name} gives Choice items to ${ours.toFixed(1)}% of Pokemon; upstream gives ${theirs.toFixed(1)}%`
			);
		}
	});

	it('should only give Triage to a FNAF set that has a healing move', function () {
		this.timeout(0);
		const dex = Dex.mod('gen9fnaf');
		const hasHealingMove = moves => [...moves].some(moveid => dex.moves.get(moveid).flags['heal']);
		let seen = 0;
		for (const { mod, format } of randomFormats()) {
			if (mod.id !== 'gen9fnaf') continue;
			const generator = Teams.getGenerator(format, [1, 2, 3, 4]);
			const isDoubles = format.gameType === 'doubles';
			for (let i = 0; i < 300; i++) {
				const set = generator.randomSet('thepuppet', {}, false, isDoubles);
				if (set.ability !== 'Triage') continue;
				seen++;
				assert(hasHealingMove(set.moves), `${format.name}: Triage with ${set.moves.join(', ')}`);
			}
			// A set that lists both abilities falls back to the other one without a healing move.
			const species = dex.species.get('thepuppet');
			const pick = moves => generator.getAbility(
				new Set(species.types), new Set(moves), ['Triage', 'Levitate'],
				generator.queryMoves(new Set(moves), species, 'Fairy', ['Triage', 'Levitate']), {}, species, false, isDoubles, 'Fairy', 'Setup Sweeper'
			);
			assert.equal(pick(['calmmind', 'shadowball', 'dazzlinggleam', 'mysticalfire']), 'Levitate');
		}
		assert(seen > 0, 'expected The Puppet to roll Triage at least once');
	});

	it("should only hand out FNAF's items to sets that meet the item's rule", function () {
		this.timeout(0);
		const dex = Dex.mod('gen9fnaf');
		const seen = new Set();
		for (const { mod, format } of randomFormats()) {
			if (mod.id !== 'gen9fnaf') continue;
			for (let i = 0; i < 1500; i++) {
				const team = Teams.generate(format, { seed: [i, 5, 6, 7] });
				const discs = team.filter(set => set.item === 'Illusion Disc');
				assert(discs.length <= 1, `${format.name}, seed ${i}: more than one Illusion Disc`);
				assert.notEqual(team[team.length - 1].item, 'Illusion Disc', `${format.name}, seed ${i}: Illusion Disc in the last slot`);
				for (const set of team) {
					if (dex.items.get(set.item).isNonstandard !== 'FNAF') continue;
					seen.add(set.item);
					const moves = set.moves.map(moveid => dex.moves.get(moveid));
					const damaging = type => moves.some(move => move.category !== 'Status' && move.type === type);
					const what = `${format.name}, seed ${i}: ${set.species} (${set.role}; ${set.moves.join(', ')}; ${set.ability}) holds ${set.item}`;
					switch (set.item) {
					case 'Remnant':
						assert(damaging('Steel') && damaging('Ghost'), what);
						break;
					case 'Music Box':
						assert([
							'Insomnia', 'Vital Spirit', 'Comatose', 'Sweet Veil', 'Purifying Salt', 'Early Bird', 'Shed Skin',
							'Electric Surge', 'Misty Surge',
						].includes(set.ability), what);
						break;
					case 'Missing Beak':
						assert(set.moves.some(moveid => ['peck', 'drillpeck', 'pluck', 'beakblast', 'boltbeak'].includes(moveid)), what);
						break;
					case 'Illusion Disc':
						assert(!set.role.includes('Setup Sweeper'), what);
						break;
					case 'Freddy Mask': {
						const generator = Teams.getGenerator(format, [1, 2, 3, 4]);
						const counter = generator.queryMoves(new Set(set.moves), dex.species.get(set.species), set.teraType, [set.ability]);
						assert(moves.every(move => move.category === 'Status') || counter.get('setup') > 0, what);
						break;
					}
					}
				}
			}
		}
		for (const item of ['Remnant', 'Music Box', 'Missing Beak', 'Illusion Disc', 'Freddy Mask']) {
			assert(seen.has(item), `${item} never appeared in a FNAF random battle`);
		}
	});
});

describe('FNAF learnsets', () => {
	it('should keep same-named shared sections identical in every species that has them', () => {
		const source = fs.readFileSync(path.resolve(__dirname, '../../data/mods/gen9fnaf/learnsets.ts'), 'utf8');
		const sections = {};
		let species = null;
		let header = null;
		for (const line of source.split('\n')) {
			let match;
			if ((match = /^\t([a-z0-9]+): \{$/.exec(line))) {
				species = match[1];
			} else if ((match = /^\t\t\t\/\/ (.+)$/.exec(line))) {
				header = match[1];
			} else if ((match = /^\t\t\t([a-z0-9]+): \[/.exec(line)) && species && header) {
				((sections[header] ||= {})[species] ||= []).push(match[1]);
			}
		}
		let shared = 0;
		for (const sectionName in sections) {
			const copies = Object.entries(sections[sectionName]);
			if (copies.length < 2) continue;
			shared++;
			const [firstSpecies, firstMoves] = copies[0];
			for (const [otherSpecies, otherMoves] of copies) {
				assert.deepEqual(
					otherMoves, firstMoves,
					`"${sectionName}" differs between ${firstSpecies} and ${otherSpecies}`
				);
			}
		}
		assert(shared >= 4, 'expected to find the shared learnset sections');
	});
});
